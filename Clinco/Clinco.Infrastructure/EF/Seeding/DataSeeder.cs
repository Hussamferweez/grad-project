using Clinco.Application.Services;
using Clinco.Infrastructure.EF.Contexts;
using Domain.Entities;
using Domain.Enums;
using Domain.ValueObjects;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Clinco.Infrastructure.EF.Seeding;

/// <summary>
/// Ensures the database exists and seeds the data the app cannot create through
/// the API: the four roles (registration resolves "Patient" by name), one demo
/// account per role (there is no sign-up for staff), and a few services.
/// Idempotent — every block is guarded by an existence check.
/// </summary>
internal sealed class DataSeeder : IHostedService
{
    // Demo password for every seeded account. Meets the app's password policy.
    private const string DemoPassword = "Password1";

    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<DataSeeder> _logger;

    public DataSeeder(IServiceProvider serviceProvider, ILogger<DataSeeder> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    public async Task StartAsync(CancellationToken ct)
    {
        using var scope = _serviceProvider.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ClinicDbContext>();
        var hasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher>();

        await db.Database.EnsureCreatedAsync(ct);

        // ── 1. Roles (required — register/login resolve roles by name) ──────────
        if (!await db.Roles.AnyAsync(ct))
        {
            db.Roles.AddRange(
                Role.Create("Admin"),
                Role.Create("Doctor"),
                Role.Create("Receptionist"),
                Role.Create("Patient"));
            await db.SaveChangesAsync(ct);
            _logger.LogInformation("Seeded roles: Admin, Doctor, Receptionist, Patient.");
        }

        var roles = await db.Roles.ToDictionaryAsync(r => r.RoleName, r => r.Id, ct);

        // ── 2. Demo accounts (no sign-up exists for staff) ──────────────────────
        if (!await db.Users.AnyAsync(ct))
        {
            var hash = hasher.Hash(DemoPassword);

            db.Users.AddRange(
                User.Create("admin", hash, "Site", "Admin",
                    Email.Create("admin@clinico.com"), PhoneNumber.Create("+201000000000"),
                    roles["Admin"], Gender.Other),
                User.Create("drsmith", hash, "John", "Smith",
                    Email.Create("doctor@clinico.com"), PhoneNumber.Create("+201000000001"),
                    roles["Doctor"], Gender.Male),
                User.Create("reception", hash, "Rita", "Fox",
                    Email.Create("reception@clinico.com"), PhoneNumber.Create("+201000000004"),
                    roles["Receptionist"], Gender.Female),
                User.Create("monaali", hash, "Mona", "Ali",
                    Email.Create("patient@clinico.com"), PhoneNumber.Create("+201000000002"),
                    roles["Patient"], Gender.Female));

            await db.SaveChangesAsync(ct);
            _logger.LogInformation(
                "Seeded demo accounts (password '{Password}'): admin@, doctor@, reception@, patient@clinico.com.",
                DemoPassword);
        }

        // ── 3. Services ─────────────────────────────────────────────────────────
        if (!await db.Services.AnyAsync(ct))
        {
            db.Services.AddRange(
                Service.Create("Cleaning", 30),
                Service.Create("Root Canal", 60),
                Service.Create("Whitening", 45),
                Service.Create("General Checkup", 20));
            await db.SaveChangesAsync(ct);
            _logger.LogInformation("Seeded default services.");
        }
    }

    public Task StopAsync(CancellationToken ct) => Task.CompletedTask;
}
