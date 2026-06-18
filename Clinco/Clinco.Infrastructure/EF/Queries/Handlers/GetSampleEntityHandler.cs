//using Clinco.Application.DTOs;
//using Clinco.Application.Queries;
//using Clinco.Domain.Entities;
//using Clinco.Infrastructure.EF.Contexts;
//using Clinco.Infrastructure.EF.Models;
//using Clinco.Shared.Abstractions.Queries;
//using Microsoft.EntityFrameworkCore;

//namespace Clinco.Infrastructure.EF.Queries.Handlers;

//internal sealed class GetSampleEntityHandler : IQueryHandler<GetSampleEntity, SampleEntityDto>
//{
//    private readonly DbSet<SampleEntityReadModel> _SampleEntities;

//    public GetSampleEntityHandler(ReadDbContext context)
//        => _SampleEntities = context.SampleEntities;

//    public Task<SampleEntityDto> HandleAsync(GetSampleEntity query)
//        => _SampleEntities
//            .Include(pl => pl.Items)
//            .Where(pl => pl.Id == query.Id)
//            .Select(pl => pl.AsDto())
//            .AsNoTracking()
//            .SingleOrDefaultAsync();
//}

