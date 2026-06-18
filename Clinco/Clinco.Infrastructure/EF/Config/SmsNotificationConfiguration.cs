using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinco.Infrastructure.EF.Config;

internal sealed class SmsNotificationConfiguration : IEntityTypeConfiguration<SmsNotification>
{
    public void Configure(EntityTypeBuilder<SmsNotification> builder)
    {
        builder.ToTable("SmsNotifications");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.PhoneNumber).IsRequired().HasMaxLength(30);
        builder.Property(x => x.MessageType).IsRequired().HasMaxLength(100);
        builder.Property(x => x.MessageContent).IsRequired().HasMaxLength(2000);
        builder.Property(x => x.ExternalMessageId).HasMaxLength(200);
        builder.Property(x => x.FailureReason).HasMaxLength(1000);

        builder.HasOne(x => x.Appointment)
            .WithMany(x => x.SmsNotifications)
            .HasForeignKey(x => x.AppointmentId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.Patient)
            .WithMany()
            .HasForeignKey(x => x.PatientId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(x => x.AppointmentId);
        builder.HasIndex(x => x.PatientId);
    }
}
