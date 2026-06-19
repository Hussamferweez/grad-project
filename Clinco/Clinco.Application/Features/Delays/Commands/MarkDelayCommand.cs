using Application.Common.DTOs;
using Application.Common.Exceptions;
using AutoMapper;
using Domain.Entities;
using Domain.Events;
using Domain.Interfaces;
using Domain.Interfaces.Repositories;
using FluentValidation;
using MediatR;

namespace Application.Features.Delays.Commands;

// ── Command ───────────────────────────────────────────────────────────────────

public record MarkDelayCommand(
    int AppointmentId,
    int DelayDurationMinutes,
    string Reason) : IRequest<AppointmentDto>;

// ── Validator ─────────────────────────────────────────────────────────────────

public class MarkDelayCommandValidator : AbstractValidator<MarkDelayCommand>
{
    public MarkDelayCommandValidator()
    {
        RuleFor(x => x.AppointmentId).GreaterThan(0);

        RuleFor(x => x.DelayDurationMinutes)
            .InclusiveBetween(1, 480)
            .WithMessage("Delay duration must be between 1 and 480 minutes.");

        RuleFor(x => x.Reason)
            .NotEmpty().WithMessage("A reason for the delay is required.")
            .MaximumLength(500);
    }
}

// ── Handler ───────────────────────────────────────────────────────────────────

public class MarkDelayCommandHandler : IRequestHandler<MarkDelayCommand, AppointmentDto>
{
    private readonly IAppointmentRepository _appointments;
    private readonly IPublisher _publisher;
    private readonly IUnitOfWork _uow;
    private readonly IMapper _mapper;

    public MarkDelayCommandHandler(
        IAppointmentRepository appointments,
        IUnitOfWork uow,
        IPublisher publisher,
        IMapper mapper)
    {
        _appointments = appointments;
        _publisher = publisher;
        _uow = uow;
        _mapper = mapper;
    }

    public async Task<AppointmentDto> Handle(MarkDelayCommand cmd, CancellationToken ct)
    {
        var target = await _appointments.GetByIdAsync(cmd.AppointmentId, ct)
            ?? throw new NotFoundException(nameof(Domain.Entities.Appointment), cmd.AppointmentId);

        var dentistId = target.DentistId;
        var date = target.AppointmentDate;
        var fromTime = target.AppointmentTime;

        var appointments = await _appointments.GetByDentistAndDateAsync(dentistId, date, ct);

        var affectedAppointments = appointments
            .Where(a => a.AppointmentTime >= fromTime)
            .OrderBy(a => a.AppointmentTime)
            .ToList();

        foreach (var appt in affectedAppointments)
        {
            appt.MarkDelay(cmd.Reason, cmd.DelayDurationMinutes);
            //await _appointments.UpdateAsync(appt, ct);
        }

        await _uow.SaveChangesAsync(ct); // single save after all changes, not per-iteration

        foreach (var appt in affectedAppointments)
        {
            await _publisher.Publish(new SmsNotificationRequestedEvent(
                appt.Id,
                appt.PatientId,
                appt.Patient.PhoneNumber,
                "Appointment Delayed",
                $"Dear {appt.Patient.FullName}, your appointment has been delayed to {appt.AppointmentTime}"
            ));
        }

        // Map directly from the already-tracked, already-updated instance — no reload
        var updatedTarget = affectedAppointments.First(a => a.Id == cmd.AppointmentId);
        return _mapper.Map<AppointmentDto>(updatedTarget);
    }
}
