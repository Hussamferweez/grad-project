//using Clinco.Domain.Entities;
//using Clinco.Domain.ValueObjects;
//using Clinco.Infrastructure.EF.Config;
//using Microsoft.EntityFrameworkCore;

//namespace Clinco.Infrastructure.EF.Contexts;

//internal sealed class WriteDbContext : DbContext
//{
//    public DbSet<SampleEntity> SampleEntities { get; set; }



//    public WriteDbContext(DbContextOptions<WriteDbContext> options) : base(options)
//    {
//    }

//    protected override void OnModelCreating(ModelBuilder modelBuilder)
//    {
//        modelBuilder.HasDefaultSchema("SampleEntity");

//        var configuration = new WriteConfiguration();
//        modelBuilder.ApplyConfiguration<SampleEntity>(configuration);
//        modelBuilder.ApplyConfiguration<SampleEntityItem>(configuration);
//    }
//}

