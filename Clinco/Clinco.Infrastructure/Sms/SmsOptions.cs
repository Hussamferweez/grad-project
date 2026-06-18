namespace Clinco.Infrastructure.Sms;

public sealed class SmsOptions
{
    public bool Enabled { get; set; }
    public string BaseUrl { get; set; } = string.Empty;
    public string ApiKey { get; set; } = string.Empty;
    public string SenderName { get; set; } = "Clinco";
    public string ApiSecret { get; internal set; }
}
