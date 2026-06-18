using Domain.Entities;
using Domain.Interfaces.Repositories;
using Clinco.Infrastructure.EF.Contexts;
using Microsoft.EntityFrameworkCore;

namespace Clinco.Infrastructure.EF.Repositories;

internal sealed class ScheduleRepository(ClinicDbContext dbContext) : IScheduleRepository
{
    public async Task<Schedule?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        => await dbContext.Schedules
            .Include(x => x.Dentist)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

    public async Task<IReadOnlyList<Schedule>> GetByDentistIdAsync(int dentistId, CancellationToken cancellationToken = default)
        => await dbContext.Schedules
            .AsNoTracking()
            .Where(x => x.DentistId == dentistId)
            .OrderBy(x => x.Date)
            .ThenBy(x => x.StartTime)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<Schedule>> GetByDentistAndDateRangeAsync(
        int dentistId,
        DateOnly from,
        DateOnly to,
        CancellationToken cancellationToken = default)
        => await dbContext.Schedules
            .AsNoTracking()
            .Where(x => x.DentistId == dentistId && x.Date >= from && x.Date <= to)
            .OrderBy(x => x.Date)
            .ThenBy(x => x.StartTime)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<Schedule>> GetAvailableSlotsAsync(
        DateOnly from,
        DateOnly to,
        CancellationToken cancellationToken = default)
        => await dbContext.Schedules
            .AsNoTracking()
            .Where(x => x.IsAvailable && x.Date >= from && x.Date <= to)
            .OrderBy(x => x.Date)
            .ThenBy(x => x.StartTime)
            .ToListAsync(cancellationToken);

    public async Task<Schedule?> GetByDentistAndDateAsync(
        int dentistId,
        DateOnly date,
        CancellationToken cancellationToken = default)
        => await dbContext.Schedules
            .FirstOrDefaultAsync(x => x.DentistId == dentistId && x.Date == date, cancellationToken);

    public async Task<Schedule> CreateAsync(Schedule schedule, CancellationToken cancellationToken = default)
    {
        await dbContext.Schedules.AddAsync(schedule, cancellationToken);
        return schedule;
    }

    public Task UpdateAsync(Schedule schedule, CancellationToken cancellationToken = default)
    {
        dbContext.Schedules.Update(schedule);
        return Task.CompletedTask;
    }

    public async Task DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var entity = await dbContext.Schedules.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (entity is not null)
        {
            dbContext.Schedules.Remove(entity);
        }
    }
}
