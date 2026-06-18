using Clinco.Infrastructure.EF.Contexts;
using Domain.Entities;
using Domain.Interfaces.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Clinco.Infrastructure.EF.Repositories;

internal sealed class ServiceRepository(ClinicDbContext dbContext) : IServiceRepository
{
    public async Task<Service?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        => await dbContext.Services.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

    public async Task<Service?> GetByNameAsync(string name, CancellationToken cancellationToken = default)
        => await dbContext.Services.FirstOrDefaultAsync(x => x.Name == name, cancellationToken);

    public async Task<IReadOnlyList<Service>> GetAllAsync(CancellationToken cancellationToken = default)
        => await dbContext.Services
            .AsNoTracking()
            .OrderBy(x => x.Name)
            .ToListAsync(cancellationToken);

    public async Task<Service> CreateAsync(Service service, CancellationToken cancellationToken = default)
    {
        await dbContext.Services.AddAsync(service, cancellationToken);
        return service;
    }

    public Task UpdateAsync(Service service, CancellationToken cancellationToken = default)
    {
        dbContext.Services.Update(service);
        return Task.CompletedTask;
    }
}
