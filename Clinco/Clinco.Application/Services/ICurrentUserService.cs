namespace Clinco.Application.Services;

/// <summary>
/// Provides identity information about the currently authenticated user.
/// Implemented in the API layer (reads from HttpContext / ClaimsPrincipal)
/// and injected into handlers that need the caller's context.
/// </summary>
public interface ICurrentUserService
{
    int UserId { get; }
    string Email { get; }
    string Role { get; }
    bool IsAuthenticated { get; }
}
