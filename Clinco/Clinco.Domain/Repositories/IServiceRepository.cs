using Domain.Entities;

namespace Domain.Interfaces.Repositories;

public interface IServiceRepository
{
    Task<Service?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<Service?> GetByNameAsync(string name, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Service>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<Service> CreateAsync(Service service, CancellationToken cancellationToken = default);
    Task UpdateAsync(Service service, CancellationToken cancellationToken = default);
}
