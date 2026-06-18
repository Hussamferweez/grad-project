using System.Text.RegularExpressions;

namespace Domain.ValueObjects;

/// <summary>
/// Strongly-typed email address with built-in format validation.
/// </summary>
public sealed record Email
{
    private static readonly Regex EmailRegex =
        new(@"^[^@\s]+@[^@\s]+\.[^@\s]+$", RegexOptions.Compiled | RegexOptions.IgnoreCase);

    public string Value { get; }

    private Email(string value) => Value = value;

    public static Email Create(string value)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(value, nameof(value));

        var trimmed = value.Trim().ToLowerInvariant();

        if (!EmailRegex.IsMatch(trimmed))
            throw new ArgumentException($"'{value}' is not a valid email address.", nameof(value));

        return new Email(trimmed);
    }

    public static implicit operator string(Email email) => email.Value;

    public override string ToString() => Value;
}
