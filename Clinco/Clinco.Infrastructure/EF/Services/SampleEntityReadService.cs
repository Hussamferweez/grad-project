//using Clinco.Application.Services;
//using Clinco.Infrastructure.EF.Contexts;
//using Clinco.Infrastructure.EF.Models;
//using Microsoft.EntityFrameworkCore;

//namespace Clinco.Infrastructure.EF.Services;

//internal sealed class SampleEntityReadService : ISampleEntityReadService
//{
//    private readonly DbSet<SampleEntityReadModel> _sampleEntity;

//    public SampleEntityReadService(ReadDbContext context)
//        => _sampleEntity = context.SampleEntities;

//    public Task<bool> ExistsByNameAsync(string name)
//        => _sampleEntity.AnyAsync(pl => pl.Name == name);
//}

