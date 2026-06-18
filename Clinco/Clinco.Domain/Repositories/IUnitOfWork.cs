namespace Domain.Interfaces;

/// <summary>
/// Wraps the database transaction boundary.
/// Handlers work with repositories and call SaveChangesAsync once
/// through IUnitOfWork — domain events are dispatched before the commit.
/// </summary>
public interface IUnitOfWork
{
    /// <summary>
    /// Persists all pending changes and dispatches any collected domain events.
    /// </summary>
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
