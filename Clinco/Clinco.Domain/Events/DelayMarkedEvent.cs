using Domain.Common;

namespace Domain.Events;

public sealed record DelayMarkedEvent(
    int AppointmentId,
    int PatientId,
    int DentistId,
    int DelayDurationMinutes,
    string Reason) : IDomainEvent
{
    public Guid EventId { get; } = Guid.NewGuid();
    public DateTime OccurredAt { get; } = DateTime.UtcNow;
}
