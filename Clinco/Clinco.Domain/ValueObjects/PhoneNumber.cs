using System.Text.RegularExpressions;

namespace Domain.ValueObjects;

/// <summary>
/// Strongly-typed phone number stored in E.164 format (e.g. +201012345678).
/// Accepts local or international formats and normalises them.
/// </summary>
public sealed record PhoneNumber
{
    // Allows optional leading +, then 7–15 digits
    private static readonly Regex PhoneRegex =
        new(@"^\+?[0-9]{7,15}$", RegexOptions.Compiled);

    public string Value { get; }

    private PhoneNumber(string value) => Value = value;

    public static PhoneNumber Create(string value)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(value, nameof(value));

        // Strip spaces and dashes for normalisation
        var normalised = value.Trim().Replace(" ", "").Replace("-", "");

        if (!PhoneRegex.IsMatch(normalised))
            throw new ArgumentException($"'{value}' is not a valid phone number.", nameof(value));

        // Ensure E.164 prefix
        if (!normalised.StartsWith('+'))
            normalised = "+" + normalised;

        return new PhoneNumber(normalised);
    }

    public static implicit operator string(PhoneNumber phone) => phone.Value;

    public override string ToString() => Value;
}
