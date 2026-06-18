using Domain.Entities;

namespace Domain.Interfaces.Repositories;

public interface IUserRepository
{
    Task<User?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default);
    Task<User?> GetByPhoneAsync(string phoneNumber, CancellationToken cancellationToken = default);
    Task<User?> GetByUsernameAsync(string username, CancellationToken cancellationToken = default);

    /// <summary>Returns all users with a given roleId (e.g. all Doctors).</summary>
    Task<IReadOnlyList<User>> GetByRoleAsync(int roleId, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<User>> GetAllAsync(CancellationToken cancellationToken = default);

    Task<User> CreateAsync(User user, CancellationToken cancellationToken = default);
    Task UpdateAsync(User user, CancellationToken cancellationToken = default);

    Task<bool> ExistsAsync(string email, string phoneNumber, CancellationToken cancellationToken = default);
}
