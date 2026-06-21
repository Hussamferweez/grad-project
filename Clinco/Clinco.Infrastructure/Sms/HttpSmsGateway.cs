using Clinco.Application.Services;
using Domain.Entities;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System.Net.Http.Headers;
using System.Net.Http.Json;
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
            var client = new TwilioRestClient("AC595eeef10038822afb1bf2e77576964c", "f8e83f837ce8bd0b42475ceef20fb3c8");

            var message = await MessageResource.CreateAsync(
                to: new PhoneNumber(phoneNumber),
                from: new PhoneNumber("+1 817 631 4549"),
                body: messageContent,
                client: client
            );

            logger.LogInformation(
                "SMS sent via Twilio. Sid: {MessageSid}, Status: {Status}, To: {Phone}",
                message.Sid, message.Status, phoneNumber);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to send SMS via Twilio to {Phone}", phoneNumber);
        }
    }
}
