using Domain.Common;

namespace Domain.Events;

public sealed record AppointmentCancelledEvent(
    int AppointmentId,
    int PatientId,
    int DentistId) : IDomainEvent
{
    public Guid EventId { get; } = Guid.NewGuid();
    public DateTime OccurredAt { get; } = DateTime.UtcNow;
}
