namespace Clinco.Application.Services;

public interface ISmsGateway
{
    Task SendAsync(string phoneNumber, string messageContent, CancellationToken cancellationToken);
}

public sealed record SmsSendResult(bool IsSuccess, string? ProviderMessageId, string? ErrorMessage);
