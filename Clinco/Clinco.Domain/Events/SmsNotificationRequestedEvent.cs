using Domain.Common;

namespace Domain.Events;

/// <summary>
/// Raised when the system determines that an SMS should be sent.
/// The Application layer listens for this and dispatches the actual send command.
/// </summary>
public sealed record SmsNotificationRequestedEvent(
    int AppointmentId,
    int PatientId,
    string PhoneNumber,
    string MessageType,
    string MessageContent) : IDomainEvent
{
    public Guid EventId { get; } = Guid.NewGuid();
    public DateTime OccurredAt { get; } = DateTime.UtcNow;
}
