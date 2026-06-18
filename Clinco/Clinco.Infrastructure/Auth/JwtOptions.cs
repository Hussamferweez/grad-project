namespace Clinco.Infrastructure.Auth;

public sealed class JwtOptions
{
    public string Issuer { get; set; } = string.Empty;
    public string Audience { get; set; } = string.Empty;
    public string SigningKey { get; set; } = string.Empty;

    /// <summary>Access-token lifetime in minutes. Defaults to 30 days.</summary>
    public int ExpirationMinutes { get; set; } = 43200;
}
