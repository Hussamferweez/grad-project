using Clinco.Application.Services;
using Domain.Entities;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using Vonage;

namespace Clinco.Infrastructure.Sms;

internal sealed class HttpSmsGateway(
    HttpClient httpClient,
    IOptions<SmsOptions> options,
    ILogger<HttpSmsGateway> logger) : ISmsGateway
{
    private readonly SmsOptions _options = options.Value;

    public async Task SendAsync(string phoneNumber, string messageContent, CancellationToken cancellationToken)
    {
        if (!_options.Enabled)
        {
            logger.LogInformation(
                "SMS provider disabled. Simulated send to {PhoneNumber})",
                phoneNumber);

            return;
        }

        try
        {
            var credentials = Vonage.Request.Credentials.FromApiKeyAndSecret(
                _options.ApiKey,
                _options.ApiSecret
            );
            var client = new VonageClient(credentials);

            var response = await client.SmsClient.SendAnSmsAsync(new Vonage.Messaging.SendSmsRequest
            {
                To = phoneNumber,
                From = "+201270079243",
                Text = messageContent
            });

            if (response.Messages.Any(m => m.Status != "0"))
            {
                logger.LogError($"Failed to send SMS: {response.Messages.FirstOrDefault()?.ErrorText}");
            }
            logger.LogInformation($"SMS sent successfully to {phoneNumber} from {_options.SenderName}. Message: {messageContent}");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while sending SMS notification.");
        }
    }
}
