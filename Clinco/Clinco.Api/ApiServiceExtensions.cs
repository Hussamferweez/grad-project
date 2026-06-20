using API.Services;
using Clinco.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Scalar.AspNetCore;
using System.Text;

namespace API.Extensions;

public static class ApiServiceExtensions
{
    public static IServiceCollection AddApiServices(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddHttpContextAccessor();
        services.AddScoped<ICurrentUserService, CurrentUserService>();

        services.AddControllers();

        // ── JWT Authentication ─────────────────────────────────────────────
        var jwtKey    = configuration["Jwt:SigningKey"]    ?? throw new InvalidOperationException("Jwt:Key is not configured.");
        var jwtIssuer = configuration["Jwt:Issuer"] ?? throw new InvalidOperationException("Jwt:Issuer is not configured.");
        var jwtAudience = configuration["Jwt:Audience"] ?? throw new InvalidOperationException("Jwt:Audience is not configured.");

        // Fail fast on a missing/weak/placeholder signing key. The same key signs both
        // access and refresh tokens, so a guessable key is a full authentication bypass.
        if (jwtKey.Length < 32
            || jwtKey.StartsWith("CHANGE_THIS", StringComparison.OrdinalIgnoreCase)
            || jwtKey.StartsWith("DEV_ONLY", StringComparison.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException(
                "Jwt:SigningKey is too short (<32 chars) or still set to a placeholder. " +
                "Provide a strong, random key via environment variables or user-secrets " +
                "(e.g. dotnet user-secrets set \"Jwt:SigningKey\" \"<random 48+ char value>\").");
        }

        services
            .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer           = true,
                    ValidateAudience         = true,
                    ValidateLifetime         = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer              = jwtIssuer,
                    ValidAudience            = jwtAudience,
                    IssuerSigningKey         = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
                    ClockSkew                = TimeSpan.Zero  // No grace period on expiry
                };
            });

        // ── Authorization policies ─────────────────────────────────────────
        services.AddAuthorization(options =>
        {
            options.DefaultPolicy = new AuthorizationPolicyBuilder(JwtBearerDefaults.AuthenticationScheme)
                .RequireAuthenticatedUser()
                .RequireRole("Admin", "Doctor", "Receptionist")
                .Build();

            options.AddPolicy("AdminOnly", p => p.RequireRole("Admin"));
            options.AddPolicy("DoctorOrAdmin", p => p.RequireRole("Doctor", "Admin"));
            options.AddPolicy("ReceptionistOrAdmin", p => p.RequireRole("Receptionist", "Admin"));
            options.AddPolicy("ClinicStaff", p => p.RequireRole("Admin", "Doctor", "Receptionist"));
        });

        // ── CORS ───────────────────────────────────────────────────────────
        services.AddCors(options =>
        {
            options.AddPolicy("AllowFrontend", policy =>
                policy
                    .WithOrigins(
                        configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
                        ?? ["http://localhost:3000"])
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowCredentials());
        });

        // ── OpenAPI / Scalar ───────────────────────────────────────────────
        services.AddOpenApi(options =>
        {
            options.AddDocumentTransformer((doc, _, _) =>
            {
                doc.Info = new()
                {
                    Title       = "Clinco — Dental Clinic Management API",
                    Version     = "v1",
                    Description = "REST API for managing appointments, schedules, and SMS notifications."
                };
                return Task.CompletedTask;
            });

            // Add JWT bearer scheme to Scalar UI
            options.AddDocumentTransformer<BearerSecuritySchemeTransformer>();
        });

        return services;
    }

    public static WebApplication UseApiMiddleware(this WebApplication app)
    {
        app.UseMiddleware<Middleware.GlobalExceptionHandlingMiddleware>();
        app.UseCors("AllowFrontend");
        app.UseAuthentication();
        app.UseAuthorization();
        app.MapControllers();

        if (app.Environment.IsDevelopment())
        {
            app.MapOpenApi();
            app.MapScalarApiReference(options =>
            {
                options.Title  = "Clinco API";
                options.Theme  = ScalarTheme.Purple;
                options.DefaultHttpClient = new(ScalarTarget.CSharp, ScalarClient.HttpClient);
            });
        }

        return app;
    }
}

// ── Adds JWT Bearer to the OpenAPI security schemes ───────────────────────────

internal sealed class BearerSecuritySchemeTransformer
    : Microsoft.AspNetCore.OpenApi.IOpenApiDocumentTransformer
{
    public Task TransformAsync(
        Microsoft.OpenApi.Models.OpenApiDocument document,
        Microsoft.AspNetCore.OpenApi.OpenApiDocumentTransformerContext context,
        CancellationToken cancellationToken)
    {
        document.Components ??= new OpenApiComponents();
        document.Components.SecuritySchemes["Bearer"] = new OpenApiSecurityScheme
        {
            Type        = SecuritySchemeType.Http,
            Scheme      = "bearer",
            BearerFormat = "JWT",
            Description = "Enter your JWT access token."
        };

        // Apply globally so every endpoint shows the lock icon in Scalar
        document.SecurityRequirements.Add(new OpenApiSecurityRequirement
        {
            [new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Id = "Bearer", Type = ReferenceType.SecurityScheme }
            }] = []
        });

        return Task.CompletedTask;
    }
}
