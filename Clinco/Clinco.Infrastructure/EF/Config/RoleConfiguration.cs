using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinco.Infrastructure.EF.Config;

internal sealed class RoleConfiguration : IEntityTypeConfiguration<Role>
{
    public void Configure(EntityTypeBuilder<Role> builder)
    {
        builder.ToTable("Roles");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.RoleName)
            .IsRequired()
            .HasMaxLength(100);

        builder.HasIndex(x => x.RoleName).IsUnique();

        builder.Property(x => x.Permissions)
            .HasMaxLength(2000);
    }
}
