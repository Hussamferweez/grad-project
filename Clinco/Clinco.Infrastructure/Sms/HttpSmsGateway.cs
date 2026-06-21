using Clinco.Application.Services;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System.Text.RegularExpressions;
using Vonage;

namespace Clinco.Infrastructure.Sms;

internal sealed class HttpSmsGateway(
    IOptions<SmsOptions> options,
    ILogger<HttpSmsGateway> logger) : ISmsGateway
{

    public async Task SendAsync(string phoneNumber, string messageContent, CancellationToken cancellationToken)
    {
        var smsOptions = options.Value;
        var normalizedPhoneNumber = NormalizePhoneNumber(phoneNumber);

        if (!smsOptions.Enabled)
            throw new InvalidOperationException("SMS sending is disabled in configuration.");

        if (string.IsNullOrWhiteSpace(smsOptions.ApiKey) || string.IsNullOrWhiteSpace(smsOptions.ApiSecret))
            throw new InvalidOperationException("SMS API credentials are missing.");

        try
        {
            var credentials = Vonage.Request.Credentials.FromApiKeyAndSecret(
                smsOptions.ApiKey,
                smsOptions.ApiSecret
            );
            var client = new VonageClient(credentials);

            var response = await client.SmsClient.SendAnSmsAsync(new Vonage.Messaging.SendSmsRequest
            {
                To = normalizedPhoneNumber,
                From = smsOptions.SenderName,
                Text = messageContent
            });

            var failedMessage = response.Messages.FirstOrDefault(m => m.Status != "0");
            if (failedMessage is not null)
                throw new InvalidOperationException(failedMessage.ErrorText ?? "SMS provider rejected the message.");

            logger.LogInformation("SMS sent successfully to {Phone}. Message: {Message}",
                normalizedPhoneNumber, messageContent);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to send SMS to {Phone}", normalizedPhoneNumber);
            throw;
        }
    }

    private static string NormalizePhoneNumber(string phoneNumber)
    {
        var value = Regex.Replace(phoneNumber.Trim(), @"[\s\-()]", "");

        if (value.StartsWith("+20"))
            return value;

        if (value.StartsWith("0020"))
            return $"+{value[2..]}";

        if (value.StartsWith("+0"))
            return $"+20{value[2..]}";

        if (value.StartsWith("0"))
            return $"+20{value[1..]}";

        if (value.StartsWith("20"))
            return $"+{value}";

        return value.StartsWith("+") ? value : $"+{value}";
    }
}
