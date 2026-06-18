using Domain.Entities;
using Domain.Interfaces.Repositories;
using Clinco.Infrastructure.EF.Contexts;
using Microsoft.EntityFrameworkCore;

namespace Clinco.Infrastructure.EF.Repositories;

internal sealed class SmsNotificationRepository(ClinicDbContext dbContext) : ISmsNotificationRepository
{
    public async Task<SmsNotification?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        => await dbContext.SmsNotifications
            .Include(x => x.Appointment)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

    public async Task<IReadOnlyList<SmsNotification>> GetByAppointmentIdAsync(
        int appointmentId,
        CancellationToken cancellationToken = default)
        => await dbContext.SmsNotifications
            .AsNoTracking()
            .Where(x => x.AppointmentId == appointmentId)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<SmsNotification>> GetByPatientIdAsync(
        int patientId,
        CancellationToken cancellationToken = default)
        => await dbContext.SmsNotifications
            .AsNoTracking()
            .Where(x => x.PatientId == patientId)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(cancellationToken);

    public async Task<SmsNotification> CreateAsync(SmsNotification notification, CancellationToken cancellationToken = default)
    {
        await dbContext.SmsNotifications.AddAsync(notification, cancellationToken);
        return notification;
    }

    public Task UpdateAsync(SmsNotification notification, CancellationToken cancellationToken = default)
    {
        dbContext.SmsNotifications.Update(notification);
        return Task.CompletedTask;
    }
}
