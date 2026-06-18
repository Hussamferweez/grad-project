using Domain.Common;

namespace Domain.Events;

public sealed record AppointmentBookedEvent(
    int AppointmentId,
    int PatientId,
    int DentistId,
    DateOnly AppointmentDate) : IDomainEvent
{
    public Guid EventId { get; } = Guid.NewGuid();
    public DateTime OccurredAt { get; } = DateTime.UtcNow;
}
