using Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Clinco.Infrastructure.EF.Contexts;

internal sealed class ClinicDbContext(DbContextOptions<ClinicDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<Service> Services => Set<Service>();
    public DbSet<Schedule> Schedules => Set<Schedule>();
    public DbSet<Appointment> Appointments => Set<Appointment>();
    public DbSet<SmsNotification> SmsNotifications => Set<SmsNotification>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ClinicDbContext).Assembly);
    }
}
