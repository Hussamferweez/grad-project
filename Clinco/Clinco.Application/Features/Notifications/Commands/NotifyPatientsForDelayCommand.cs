using Application.Common.Exceptions;
using Domain.Enums;
using Domain.Events;
using Domain.Interfaces.Repositories;
using FluentValidation;
using MediatR;

namespace Application.Features.Notifications.Commands;

// ── Command ───────────────────────────────────────────────────────────────────

/// <summary>
/// Receptionist calls this after a delay is known.
/// Finds all Booked/Confirmed appointments on the given date and
/// raises SmsNotificationRequestedEvent for each affected patient.
/// </summary>
public record NotifyPatientsForDelayCommand(
    string Date,
    string DelayMessage) : IRequest<int>;  // returns count of patients notified

// ── Validator ─────────────────────────────────────────────────────────────────

public class NotifyPatientsForDelayCommandValidator : AbstractValidator<NotifyPatientsForDelayCommand>
{
    public NotifyPatientsForDelayCommandValidator()
    {
        RuleFor(x => x.Date)
            .NotEmpty()
            .Must(d => DateOnly.TryParse(d, out _)).WithMessage("Date must be in yyyy-MM-dd format.");

        RuleFor(x => x.DelayMessage).NotEmpty().MaximumLength(500);
    }
}

// ── Handler ───────────────────────────────────────────────────────────────────

public class NotifyPatientsForDelayCommandHandler
    : IRequestHandler<NotifyPatientsForDelayCommand, int>
{
    private readonly IAppointmentRepository _appointments;
    private readonly IPublisher _publisher;

    public NotifyPatientsForDelayCommandHandler(
        IAppointmentRepository appointments,
        IPublisher publisher)
    {
        _appointments = appointments;
        _publisher = publisher;
    }

    public async Task<int> Handle(NotifyPatientsForDelayCommand cmd, CancellationToken ct)
    {
        var date = DateOnly.Parse(cmd.Date);

        var affected = await _appointments.GetUpcomingByDateAsync(
            date,
            [AppointmentStatus.Booked, AppointmentStatus.Confirmed],
            ct);

        if (affected.Count == 0) return 0;

        foreach (var appointment in affected)
        {
            var message = BuildMessage(appointment.Patient.FullName, cmd.DelayMessage);

            await _publisher.Publish(new SmsNotificationRequestedEvent(
                appointment.Id,
                appointment.PatientId,
                appointment.Patient.PhoneNumber,
                "DelayAlert",
                message));
        }

        return affected.Count;
    }

    private static string BuildMessage(string patientName, string delayMessage)
        => $"Dear {patientName}, your appointment has been delayed. {delayMessage} We apologise for the inconvenience.";
}
