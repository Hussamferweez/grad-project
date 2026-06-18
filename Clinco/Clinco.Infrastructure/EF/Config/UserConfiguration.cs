using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinco.Infrastructure.EF.Config;

internal sealed class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("Users");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Username).IsRequired().HasMaxLength(100);
        builder.Property(x => x.PasswordHash).IsRequired().HasMaxLength(500);
        builder.Property(x => x.FirstName).IsRequired().HasMaxLength(100);
        builder.Property(x => x.LastName).IsRequired().HasMaxLength(100);
        builder.Property(x => x.Email).IsRequired().HasMaxLength(254);
        builder.Property(x => x.PhoneNumber).IsRequired().HasMaxLength(30);
        builder.Property(x => x.Address).HasMaxLength(500);
        builder.Property(x => x.EmergencyContact).HasMaxLength(200);
        builder.Property(x => x.MedicalNotes).HasMaxLength(4000);

        builder.HasIndex(x => x.Username).IsUnique();
        builder.HasIndex(x => x.Email).IsUnique();
        builder.HasIndex(x => x.PhoneNumber).IsUnique();

        builder.HasOne(x => x.Role)
            .WithMany(x => x.Users)
            .HasForeignKey(x => x.RoleId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
