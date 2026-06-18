using Domain.Entities;

namespace Domain.Interfaces.Repositories;

public interface ISmsNotificationRepository
{
    Task<SmsNotification?> GetByIdAsync(int id, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<SmsNotification>> GetByAppointmentIdAsync(
        int appointmentId,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<SmsNotification>> GetByPatientIdAsync(
        int patientId,
        CancellationToken cancellationToken = default);

    Task<SmsNotification> CreateAsync(SmsNotification notification, CancellationToken cancellationToken = default);
    Task UpdateAsync(SmsNotification notification, CancellationToken cancellationToken = default);
}
