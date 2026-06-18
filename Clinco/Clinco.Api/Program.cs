using API.Extensions;
using Clinco.Application;
using Clinco.Infrastructure;
using Serilog;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;

// ── Bootstrap Serilog before the host builds so startup errors are captured ───

Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .CreateBootstrapLogger();

try
{
    var builder = WebApplication.CreateBuilder(args);

    // ── Serilog ───────────────────────────────────────────────────────────
    builder.Host.UseSerilog((ctx, services, config) =>
    {
        config
            .ReadFrom.Configuration(ctx.Configuration)
            .ReadFrom.Services(services)
            .Enrich.FromLogContext()
            .Enrich.WithMachineName()
            .Enrich.WithEnvironmentName()
            .WriteTo.Console(outputTemplate:
                "[{Timestamp:HH:mm:ss} {Level:u3}] {SourceContext} {Message:lj}{NewLine}{Exception}")
            .WriteTo.File(
                path: "logs/clinco-.log",
                rollingInterval: RollingInterval.Day,
                retainedFileCountLimit: 14);
    });

    // ── Services ──────────────────────────────────────────────────────────
    builder.Services.AddApplicationServices();
    builder.Services.AddInfrastructure(builder.Configuration);  // from Infrastructure DI
    builder.Services.AddApiServices(builder.Configuration);
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGen(c =>
    {
        c.CustomSchemaIds(type => type.FullName);
    });

    // ── Build & configure pipeline ────────────────────────────────────────
    var app = builder.Build();

    app.UseSwagger();
    app.UseSwaggerUI();

    app.UseSerilogRequestLogging(options =>
    {
        options.MessageTemplate =
            "HTTP {RequestMethod} {RequestPath} responded {StatusCode} in {Elapsed:0.0000} ms";
    });

    app.UseApiMiddleware();

    // Auto-apply EF Core migrations on startup in development
    //if (app.Environment.IsDevelopment())
    //{
    //    using var scope = app.Services.CreateScope();
    //    var db = scope.ServiceProvider
    //        .GetRequiredService<Infrastructure.AppDbContext>();
    //    await db.Database.MigrateAsync();
    //}

    await app.RunAsync();
}
catch (Exception ex) when (ex is not HostAbortedException)
{
    Log.Fatal(ex, "Application terminated unexpectedly.");
}
finally
{
    await Log.CloseAndFlushAsync();
}
