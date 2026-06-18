using Domain.Entities;

namespace Domain.Interfaces.Repositories;

public interface IScheduleRepository
{
    Task<Schedule?> GetByIdAsync(int id, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Schedule>> GetByDentistIdAsync(
        int dentistId,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Schedule>> GetByDentistAndDateRangeAsync(
        int dentistId,
        DateOnly from,
        DateOnly to,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Returns all available schedule dates within a range — used to
    /// populate the patient's booking calendar.
    /// </summary>
    Task<IReadOnlyList<Schedule>> GetAvailableSlotsAsync(
        DateOnly from,
        DateOnly to,
        CancellationToken cancellationToken = default);

    Task<Schedule?> GetByDentistAndDateAsync(
        int dentistId,
        DateOnly date,
        CancellationToken cancellationToken = default);

    Task<Schedule> CreateAsync(Schedule schedule, CancellationToken cancellationToken = default);
    Task UpdateAsync(Schedule schedule, CancellationToken cancellationToken = default);
    Task DeleteAsync(int id, CancellationToken cancellationToken = default);
}
