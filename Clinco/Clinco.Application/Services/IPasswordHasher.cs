namespace Clinco.Application.Services;

/// <summary>
/// Abstracts BCrypt / PBKDF2 so the Application layer never references
/// a concrete hashing library directly.
/// </summary>
public interface IPasswordHasher
{
    string Hash(string plainText);
    bool Verify(string plainText, string hash);
}
