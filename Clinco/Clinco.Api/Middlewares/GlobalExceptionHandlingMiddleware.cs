using Application.Common.Exceptions;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using System.Net;
using System.Text.Json;

namespace API.Middleware;

/// <summary>
/// Catches all unhandled exceptions and returns a consistent RFC-7807
/// ProblemDetails body so the client never sees a raw stack trace.
/// </summary>
public sealed class GlobalExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionHandlingMiddleware> _logger;

    public GlobalExceptionHandlingMiddleware(
        RequestDelegate next,
        ILogger<GlobalExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext ctx)
    {
        try
        {
            await _next(ctx);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(ctx, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext ctx, Exception ex)
    {
        _logger.LogError(ex, "Unhandled exception: {Message}", ex.Message);

        var (statusCode, title, errors) = ex switch
        {
            ValidationException ve => (
                HttpStatusCode.UnprocessableEntity,
                "Validation failed",
                ve.Errors.Select(e => e.ErrorMessage).ToArray()),

            NotFoundException =>
                (HttpStatusCode.NotFound, "Resource not found", new[] { ex.Message }),

            UnauthorizedException =>
                (HttpStatusCode.Unauthorized, "Unauthorized", new[] { ex.Message }),

            ForbiddenException =>
                (HttpStatusCode.Forbidden, "Forbidden", new[] { ex.Message }),

            ConflictException =>
                (HttpStatusCode.Conflict, "Conflict", new[] { ex.Message }),

            ArgumentException =>
                (HttpStatusCode.BadRequest, "Bad request", new[] { ex.Message }),

            // Domain/business-rule violations (e.g. time-slot conflict, modifying a
            // cancelled/completed appointment, service not found) — surface the real reason.
            InvalidOperationException =>
                (HttpStatusCode.Conflict, "Conflict", new[] { ex.Message }),

            _ => (HttpStatusCode.InternalServerError, "An unexpected error occurred",
                  new[] { "Please try again later." })
        };

        var problem = new ProblemDetails
        {
            Status = (int)statusCode,
            Title = title,
            Extensions = { ["errors"] = errors }
        };

        ctx.Response.StatusCode = (int)statusCode;
        ctx.Response.ContentType = "application/problem+json";

        // Serialize with web (camelCase) defaults so the body matches the rest of the
        // API (title/status/errors), which the client parses.
        await ctx.Response.WriteAsync(
            JsonSerializer.Serialize(problem, new JsonSerializerOptions(JsonSerializerDefaults.Web)));
    }
}
