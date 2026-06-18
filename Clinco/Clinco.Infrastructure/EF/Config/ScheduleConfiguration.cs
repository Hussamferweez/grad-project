using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinco.Infrastructure.EF.Config;

internal sealed class ScheduleConfiguration : IEntityTypeConfiguration<Schedule>
{
    public void Configure(EntityTypeBuilder<Schedule> builder)
    {
        builder.ToTable("Schedules");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.IsAvailable).IsRequired();

        builder.HasOne(x => x.Dentist)
            .WithMany(x => x.Schedules)
            .HasForeignKey(x => x.DentistId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(x => x.Appointments)
            .WithOne(x => x.Schedule)
            .HasForeignKey(x => x.ScheduleId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasIndex(x => new { x.DentistId, x.Date }).IsUnique();
    }
}
