using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinco.Infrastructure.EF.Config;

internal sealed class AppointmentConfiguration : IEntityTypeConfiguration<Appointment>
{
    public void Configure(EntityTypeBuilder<Appointment> builder)
    {
        builder.ToTable("Appointments");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.ServiceName).IsRequired().HasMaxLength(200);
        builder.Property(x => x.TreatmentNotes).HasMaxLength(4000);
        builder.Property(x => x.DelayReason).HasMaxLength(1000);

        builder.HasOne(x => x.Patient)
            .WithMany(x => x.PatientAppointments)
            .HasForeignKey(x => x.PatientId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Dentist)
            .WithMany(x => x.DentistAppointments)
            .HasForeignKey(x => x.DentistId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Service)
            .WithMany(x => x.Appointments)
            .HasForeignKey(x => x.ServiceId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(x => new { x.DentistId, x.AppointmentDate, x.AppointmentTime });
        builder.HasIndex(x => new { x.PatientId, x.AppointmentDate });
        builder.HasIndex(x => x.ServiceId);
        builder.HasIndex(x => x.Status);
    }
}
