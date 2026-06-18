using Domain.Common;

namespace Domain.Entities;

/// <summary>
/// Represents a system role (Patient, Doctor, Receptionist, Admin).
/// Permissions are stored as a comma-separated list of policy names
/// to keep the domain simple — the application layer interprets them.
/// </summary>
public class Role : BaseEntity
{
    public string RoleName { get; private set; } = default!;

    /// <summary>
    /// Comma-separated permission names e.g. "appointments:read,appointments:write"
    /// </summary>
    public string Permissions { get; private set; } = string.Empty;

    // Navigation
    public ICollection<User> Users { get; private set; } = [];

    private Role() { }

    public static Role Create(string roleName, string permissions = "")
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(roleName, nameof(roleName));

        return new Role
        {
            RoleName = roleName.Trim(),
            Permissions = permissions
        };
    }

    public void UpdatePermissions(string permissions)
        => Permissions = permissions;
}
