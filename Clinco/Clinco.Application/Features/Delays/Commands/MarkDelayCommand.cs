using Application.Common.DTOs;
using Application.Common.Exceptions;
using AutoMapper;
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
    private readonly IUnitOfWork _uow;
    private readonly IMapper _mapper;

    public MarkDelayCommandHandler(
        IAppointmentRepository appointments,
        IUnitOfWork uow,
        IMapper mapper)
    {
        _appointments = appointments;
        _uow = uow;
        _mapper = mapper;
    }

    public async Task<AppointmentDto> Handle(MarkDelayCommand cmd, CancellationToken ct)
    {
        var appointment = await _appointments.GetByIdAsync(cmd.AppointmentId, ct)
            ?? throw new NotFoundException(nameof(Domain.Entities.Appointment), cmd.AppointmentId);

        // Domain method enforces guards and raises DelayMarkedEvent
        appointment.MarkDelay(cmd.Reason, cmd.DelayDurationMinutes);

        await _appointments.UpdateAsync(appointment, ct);
        await _uow.SaveChangesAsync(ct);  // DelayMarkedEvent dispatched here

        return _mapper.Map<AppointmentDto>(appointment);
    }
}
