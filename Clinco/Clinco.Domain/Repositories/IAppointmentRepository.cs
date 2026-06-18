using Domain.Entities;
using Domain.Enums;

namespace Domain.Interfaces.Repositories;

public interface IAppointmentRepository
{
    Task<Appointment?> GetByIdAsync(int id, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Appointment>> GetByPatientIdAsync(
        int patientId,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Appointment>> GetByDentistIdAsync(
        int dentistId,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Appointment>> GetByDateAsync(
        DateOnly date,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Appointment>> GetByDentistAndDateAsync(
        int dentistId,
        DateOnly date,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Returns all Booked / Confirmed appointments on a given date
    /// that need to be notified about a delay.
    /// </summary>
    Task<IReadOnlyList<Appointment>> GetUpcomingByDateAsync(
        DateOnly date,
        AppointmentStatus[] statuses,
        CancellationToken cancellationToken = default);

    Task<Appointment> CreateAsync(Appointment appointment, CancellationToken cancellationToken = default);
    Task UpdateAsync(Appointment appointment, CancellationToken cancellationToken = default);
    Task DeleteAsync(int id, CancellationToken cancellationToken = default);

    Task<bool> HasConflictAsync(
        int dentistId,
        DateOnly date,
        TimeOnly startTime,
        int durationMinutes,
        int? excludeAppointmentId = null,
        CancellationToken cancellationToken = default);
}
