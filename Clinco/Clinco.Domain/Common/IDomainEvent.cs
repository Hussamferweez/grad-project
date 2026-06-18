namespace Domain.Common;

/// <summary>
/// Marker interface for domain events.
/// Implements MediatR's INotification so handlers can be wired
/// automatically without an extra adapter layer.
/// </summary>
public interface IDomainEvent : MediatR.INotification
{
    Guid EventId { get; }
    DateTime OccurredAt { get; }
}
