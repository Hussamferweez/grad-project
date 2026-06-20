using Clinco.Application.Services;
using Domain.Entities;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using Twilio.Base;
using Twilio.Clients;
using Twilio.Rest.Api.V2010.Account;
using Twilio.Types;
using Vonage;

namespace Clinco.Infrastructure.Sms;

internal sealed class HttpSmsGateway(
  ILogger<HttpSmsGateway> logger) : ISmsGateway
{

    public async Task SendAsync(string phoneNumber, string messageContent, CancellationToken cancellationToken)
    {
        try
        {
            var credentials = Vonage.Request.Credentials.FromApiKeyAndSecret(
                "5e7632e4",
                "IzY*nLqiY4N1m("
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
            logger.LogInformation($"SMS sent successfully to {phoneNumber} Message: {messageContent}");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to send SMS via Twilio to {Phone}", phoneNumber);
        }
    }
}
