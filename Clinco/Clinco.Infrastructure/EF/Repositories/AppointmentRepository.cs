using Domain.Entities;
using Domain.Enums;
using Domain.Interfaces.Repositories;
using Clinco.Infrastructure.EF.Contexts;
using Microsoft.EntityFrameworkCore;

namespace Clinco.Infrastructure.EF.Repositories;

internal sealed class AppointmentRepository(ClinicDbContext dbContext) : IAppointmentRepository
{
    public async Task<Appointment?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        => await dbContext.Appointments
            .Include(x => x.Patient)
            .Include(x => x.Dentist)
            .Include(x => x.Schedule)
            .FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted, cancellationToken);

    public async Task<IReadOnlyList<Appointment>> GetByPatientIdAsync(
        int patientId,
        CancellationToken cancellationToken = default)
        => await dbContext.Appointments
            .AsNoTracking()
            .Where(x => x.PatientId == patientId && !x.IsDeleted)
            .OrderBy(x => x.AppointmentDate)
            .ThenBy(x => x.AppointmentTime)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<Appointment>> GetByDentistIdAsync(
        int dentistId,
        CancellationToken cancellationToken = default)
        => await dbContext.Appointments
            .AsNoTracking()
            .Where(x => x.DentistId == dentistId && !x.IsDeleted)
            .OrderBy(x => x.AppointmentDate)
            .ThenBy(x => x.AppointmentTime)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<Appointment>> GetByDateAsync(
        DateOnly date,
        CancellationToken cancellationToken = default)
        => await dbContext.Appointments
            .AsNoTracking()
            .Where(x => x.AppointmentDate == date && !x.IsDeleted)
            .OrderBy(x => x.AppointmentTime)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<Appointment>> GetByDentistAndDateAsync(
        int dentistId,
        DateOnly date,
        CancellationToken cancellationToken = default)
        => await dbContext.Appointments
            .AsNoTracking()
            .Where(x => x.DentistId == dentistId && x.AppointmentDate == date && !x.IsDeleted)
            .OrderBy(x => x.AppointmentTime)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<Appointment>> GetUpcomingByDateAsync(
        DateOnly date,
        AppointmentStatus[] statuses,
        CancellationToken cancellationToken = default)
    {
        var statusFilter = statuses?.Length > 0
            ? statuses
            : [AppointmentStatus.Booked, AppointmentStatus.Confirmed];

        return await dbContext.Appointments
            .AsNoTracking()
            .Where(x => x.AppointmentDate == date && !x.IsDeleted && statusFilter.Contains(x.Status))
            .OrderBy(x => x.AppointmentTime)
            .ToListAsync(cancellationToken);
    }

    public async Task<Appointment> CreateAsync(Appointment appointment, CancellationToken cancellationToken = default)
    {
        await dbContext.Appointments.AddAsync(appointment, cancellationToken);
        return appointment;
    }

    public Task UpdateAsync(Appointment appointment, CancellationToken cancellationToken = default)
    {
        dbContext.Appointments.Update(appointment);
        return Task.CompletedTask;
    }

    public async Task DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var appointment = await dbContext.Appointments.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        appointment?.SoftDelete();
    }

    public async Task<bool> HasConflictAsync(
        int dentistId,
        DateOnly date,
        TimeOnly startTime,
        int durationMinutes,
        int? excludeAppointmentId = null,
        CancellationToken cancellationToken = default)
    {
        var endTime = startTime.AddMinutes(durationMinutes);

        var query = dbContext.Appointments
            .Where(x =>
                x.DentistId == dentistId &&
                x.AppointmentDate == date &&
                !x.IsDeleted &&
                x.Status != AppointmentStatus.Cancelled);

        if (excludeAppointmentId.HasValue)
        {
            query = query.Where(x => x.Id != excludeAppointmentId.Value);
        }

        return await query.AnyAsync(x =>
                x.AppointmentTime < endTime &&
                x.AppointmentTime.AddMinutes(x.DurationMinutes + x.DelayDurationMinutes) > startTime,
            cancellationToken);
    }
}
