using Domain.Entities;
using Domain.Interfaces.Repositories;
using Clinco.Infrastructure.EF.Contexts;
using Microsoft.EntityFrameworkCore;

namespace Clinco.Infrastructure.EF.Repositories;

internal sealed class RoleRepository(ClinicDbContext dbContext) : IRoleRepository
{
    public async Task<Role?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        => await dbContext.Roles.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

    public async Task<Role?> GetByNameAsync(string roleName, CancellationToken cancellationToken = default)
        => await dbContext.Roles.FirstOrDefaultAsync(x => x.RoleName == roleName, cancellationToken);

    public async Task<IReadOnlyList<Role>> GetAllAsync(CancellationToken cancellationToken = default)
        => await dbContext.Roles.AsNoTracking().ToListAsync(cancellationToken);

    public async Task<Role> CreateAsync(Role role, CancellationToken cancellationToken = default)
    {
        await dbContext.Roles.AddAsync(role, cancellationToken);
        return role;
    }

    public Task UpdateAsync(Role role, CancellationToken cancellationToken = default)
    {
        dbContext.Roles.Update(role);
        return Task.CompletedTask;
    }
}
