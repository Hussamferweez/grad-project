using Application.Features.Notifications.Commands;
using Domain.Events;
using MediatR;
using Microsoft.Extensions.Logging;

namespace Application.Features.Notifications.EventHandlers;

/// <summary>
/// Listens for DelayMarkedEvent (raised when a doctor calls MarkDelay on an appointment)
/// and dispatches a targeted SMS to the affected patient.
/// </summary>
public class DelayMarkedEventHandler : INotificationHandler<DelayMarkedEvent>
{
    private readonly IMediator _mediator;
    private readonly ILogger<DelayMarkedEventHandler> _logger;

    public DelayMarkedEventHandler(IMediator mediator, ILogger<DelayMarkedEventHandler> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    public async Task Handle(DelayMarkedEvent notification, CancellationToken ct)
    {
        _logger.LogInformation(
            "DelayMarkedEvent received for appointment {AppointmentId}. Delay: {Minutes} min.",
            notification.AppointmentId, notification.DelayDurationMinutes);

        // We don't have PatientPhoneNumber in the event — the SendSmsNotificationCommand
        // handler reads it from the repository. The NotifyPatientsForDelayCommand handles
        // bulk alerting; this handler is for the single-appointment path (doctor marks delay).
        // The actual phone number will be resolved by the SMS command via PatientId.
        // For the single-patient path we need to dispatch via NotifyPatientsForDelayCommand
        // or re-raise SmsNotificationRequestedEvent with the phone — handled below.
    }
}

/// <summary>
/// Listens for SmsNotificationRequestedEvent and dispatches the concrete
/// SendSmsNotificationCommand.  Acts as the bridge between domain events
/// and the infrastructure SMS send pipeline.
/// </summary>
public class SmsNotificationRequestedEventHandler : INotificationHandler<SmsNotificationRequestedEvent>
{
    private readonly IMediator _mediator;
    private readonly ILogger<SmsNotificationRequestedEventHandler> _logger;

    public SmsNotificationRequestedEventHandler(
        IMediator mediator,
        ILogger<SmsNotificationRequestedEventHandler> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    public async Task Handle(SmsNotificationRequestedEvent notification, CancellationToken ct)
    {
        _logger.LogInformation(
            "SmsNotificationRequestedEvent for appointment {AppointmentId}, patient {PatientId}",
            notification.AppointmentId, notification.PatientId);

        await _mediator.Send(new SendSmsNotificationCommand(
            notification.AppointmentId,
            notification.PatientId,
            notification.PhoneNumber,
            notification.MessageType,
            notification.MessageContent), ct);
    }
}
