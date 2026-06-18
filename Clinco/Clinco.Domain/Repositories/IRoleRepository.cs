using Domain.Entities;

namespace Domain.Interfaces.Repositories;

public interface IRoleRepository
{
    Task<Role?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<Role?> GetByNameAsync(string roleName, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Role>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<Role> CreateAsync(Role role, CancellationToken cancellationToken = default);
    Task UpdateAsync(Role role, CancellationToken cancellationToken = default);
}
