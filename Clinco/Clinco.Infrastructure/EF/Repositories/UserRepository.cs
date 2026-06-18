using Domain.Entities;
using Domain.Interfaces.Repositories;
using Clinco.Infrastructure.EF.Contexts;
using Microsoft.EntityFrameworkCore;

namespace Clinco.Infrastructure.EF.Repositories;

internal sealed class UserRepository(ClinicDbContext dbContext) : IUserRepository
{
    public async Task<User?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        => await dbContext.Users
            .Include(x => x.Role)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

    public async Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
        => await dbContext.Users
            .Include(x => x.Role)
            .FirstOrDefaultAsync(x => x.Email == email, cancellationToken);

    public async Task<User?> GetByPhoneAsync(string phoneNumber, CancellationToken cancellationToken = default)
        => await dbContext.Users
            .Include(x => x.Role)
            .FirstOrDefaultAsync(x => x.PhoneNumber == phoneNumber, cancellationToken);

    public async Task<User?> GetByUsernameAsync(string username, CancellationToken cancellationToken = default)
        => await dbContext.Users
            .Include(x => x.Role)
            .FirstOrDefaultAsync(x => x.Username == username, cancellationToken);

    public async Task<IReadOnlyList<User>> GetByRoleAsync(int roleId, CancellationToken cancellationToken = default)
        => await dbContext.Users
            .AsNoTracking()
            .Where(x => x.RoleId == roleId)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<User>> GetAllAsync(CancellationToken cancellationToken = default)
        => await dbContext.Users
            .AsNoTracking()
            .Include(x => x.Role)
            .ToListAsync(cancellationToken);

    public async Task<User> CreateAsync(User user, CancellationToken cancellationToken = default)
    {
        await dbContext.Users.AddAsync(user, cancellationToken);
        return user;
    }

    public Task UpdateAsync(User user, CancellationToken cancellationToken = default)
    {
        dbContext.Users.Update(user);
        return Task.CompletedTask;
    }

    public async Task<bool> ExistsAsync(string email, string phoneNumber, CancellationToken cancellationToken = default)
        => await dbContext.Users.AnyAsync(x => x.Email == email || x.PhoneNumber == phoneNumber, cancellationToken);
}
