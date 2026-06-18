using Clinco.Application.Services;
using System.Security.Claims;

namespace API.Services;

/// <summary>
/// Reads the authenticated user's identity from the current HTTP request's
/// ClaimsPrincipal and exposes it as ICurrentUserService for injection into
/// Application layer handlers.
/// </summary>
public sealed class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor)
        => _httpContextAccessor = httpContextAccessor;

    private ClaimsPrincipal? User => _httpContextAccessor.HttpContext?.User;

    public int UserId =>
        int.TryParse(User?.FindFirstValue(ClaimTypes.NameIdentifier), out var id) ? id : 0;

    public string Email =>
        User?.FindFirstValue(ClaimTypes.Email) ?? string.Empty;

    public string Role =>
        User?.FindFirstValue(ClaimTypes.Role) ?? string.Empty;

    public bool IsAuthenticated =>
        User?.Identity?.IsAuthenticated ?? false;
}
