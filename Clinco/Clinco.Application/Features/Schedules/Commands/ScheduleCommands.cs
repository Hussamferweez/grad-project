using Application.Common.Exceptions;
using Domain.Entities;
using Domain.Interfaces;
using Domain.Interfaces.Repositories;
using FluentValidation;
using MediatR;

namespace Application.Features.Schedules.Commands;

// ── CreateScheduleCommand ─────────────────────────────────────────────────────

public record CreateScheduleCommand(
    int DentistId,
    string DayOfWeek,
    string StartTime,
    string EndTime,
    string Date,
    bool IsAvailable = true) : IRequest<int>;

public class CreateScheduleCommandValidator : AbstractValidator<CreateScheduleCommand>
{
    public CreateScheduleCommandValidator()
    {
        RuleFor(x => x.DentistId).GreaterThan(0);

        RuleFor(x => x.DayOfWeek)
            .NotEmpty()
            .Must(d => Enum.TryParse<DayOfWeek>(d, true, out _))
            .WithMessage("DayOfWeek must be a valid day name (e.g. Monday).");

        RuleFor(x => x.StartTime)
            .NotEmpty()
            .Must(t => TimeOnly.TryParse(t, out _)).WithMessage("StartTime must be in HH:mm format.");

        RuleFor(x => x.EndTime)
            .NotEmpty()
            .Must(t => TimeOnly.TryParse(t, out _)).WithMessage("EndTime must be in HH:mm format.");

        RuleFor(x => x.Date)
            .NotEmpty()
            .Must(d => DateOnly.TryParse(d, out _)).WithMessage("Date must be in yyyy-MM-dd format.");
    }
}

public class CreateScheduleCommandHandler : IRequestHandler<CreateScheduleCommand, int>
{
    private readonly IScheduleRepository _schedules;
    private readonly IUserRepository _users;
    private readonly IUnitOfWork _uow;

    public CreateScheduleCommandHandler(
        IScheduleRepository schedules, IUserRepository users, IUnitOfWork uow)
    {
        _schedules = schedules;
        _users = users;
        _uow = uow;
    }

    public async Task<int> Handle(CreateScheduleCommand cmd, CancellationToken ct)
    {
        // Verify dentist exists
        var dentist = await _users.GetByIdAsync(cmd.DentistId, ct)
            ?? throw new NotFoundException(nameof(User), cmd.DentistId);

        var date      = DateOnly.Parse(cmd.Date);
        var startTime = TimeOnly.Parse(cmd.StartTime);
        var endTime   = TimeOnly.Parse(cmd.EndTime);
        var dayOfWeek = Enum.Parse<DayOfWeek>(cmd.DayOfWeek, ignoreCase: true);

        // Enforce uniqueness per dentist per date
        var existing = await _schedules.GetByDentistAndDateAsync(cmd.DentistId, date, ct);
        if (existing is not null)
            throw new ConflictException($"A schedule for dentist {cmd.DentistId} on {date} already exists.");

        var schedule = Schedule.Create(cmd.DentistId, dayOfWeek, startTime, endTime, date, cmd.IsAvailable);

        await _schedules.CreateAsync(schedule, ct);
        await _uow.SaveChangesAsync(ct);

        return schedule.Id;
    }
}

// ── UpdateScheduleAvailabilityCommand ─────────────────────────────────────────

public record UpdateScheduleAvailabilityCommand(int ScheduleId, bool IsAvailable) : IRequest;

public class UpdateScheduleAvailabilityCommandHandler : IRequestHandler<UpdateScheduleAvailabilityCommand>
{
    private readonly IScheduleRepository _schedules;
    private readonly IUnitOfWork _uow;

    public UpdateScheduleAvailabilityCommandHandler(IScheduleRepository schedules, IUnitOfWork uow)
    {
        _schedules = schedules;
        _uow = uow;
    }

    public async Task Handle(UpdateScheduleAvailabilityCommand cmd, CancellationToken ct)
    {
        var schedule = await _schedules.GetByIdAsync(cmd.ScheduleId, ct)
            ?? throw new NotFoundException(nameof(Schedule), cmd.ScheduleId);

        schedule.SetAvailability(cmd.IsAvailable);

        await _schedules.UpdateAsync(schedule, ct);
        await _uow.SaveChangesAsync(ct);
    }
}
