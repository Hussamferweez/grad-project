using Clinco.Application.Services;
using Domain.Entities;
using Domain.Events;
using Domain.Interfaces.Repositories;
using MediatR;

namespace Clinco.Infrastructure.Sms;

internal sealed class SmsNotificationRequestedEventHandler(
    ISmsGateway smsGateway,
    ISmsNotificationRepository smsNotificationRepository) : INotificationHandler<SmsNotificationRequestedEvent>
{
    public async Task Handle(SmsNotificationRequestedEvent notification, CancellationToken cancellationToken)
    {
        var smsNotification = SmsNotification.Create(
            notification.AppointmentId,
            notification.PatientId,
            notification.PhoneNumber,
            notification.MessageType,
            notification.MessageContent);

        await smsNotificationRepository.CreateAsync(smsNotification, cancellationToken);

        var sendResult = await smsGateway.SendAsync(
            notification.PhoneNumber,
            notification.MessageContent,
            cancellationToken);

        if (sendResult.IsSuccess)
        {
            smsNotification.MarkSent(sendResult.ProviderMessageId ?? $"provider-{Guid.NewGuid():N}");
        }
        else
        {
            smsNotification.MarkFailed(sendResult.ErrorMessage ?? "Unknown SMS failure.");
        }

    }
}
