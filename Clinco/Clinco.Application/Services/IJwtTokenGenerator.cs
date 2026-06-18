using Domain.Entities;

namespace Clinco.Application.Services;

public interface IJwtTokenGenerator
{
    string GenerateToken(User user);

    /// <summary>UTC instant at which a freshly generated access token expires.</summary>
    DateTime GetAccessTokenExpiry();
}
