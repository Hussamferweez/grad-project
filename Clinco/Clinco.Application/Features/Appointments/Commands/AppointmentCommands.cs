using Application.Common.DTOs;
using Application.Common.Exceptions;
using AutoMapper;
using Domain.Entities;
using Domain.Enums;
using Domain.Events;
using Domain.Interfaces;
using Domain.Interfaces.Repositories;
using FluentValidation;
using MediatR;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory.Database;

namespace Clinco.Application.Features.Appointments.Commands;

// ── BookAppointmentCommand (Patient) ──────────────────────────────────────────

public record BookAppointmentcmd(
    int PatientId,
    int DentistId,
    string AppointmentDate,
    string AppointmentTime,
    int ServiceId,
    int CreatedBy,
    int? ScheduleId = null) : IRequest<AppointmentDto>;

public class BookAppointmentcmdValidator : AbstractValidator<BookAppointmentcmd>
{
    public BookAppointmentcmdValidator()
    {
        RuleFor(x => x.PatientId).GreaterThan(0);
        RuleFor(x => x.DentistId).GreaterThan(0);

        RuleFor(x => x.AppointmentDate)
            .NotEmpty()
            .Must(d => DateOnly.TryParse(d, out var date) && date >= DateOnly.FromDateTime(DateTime.UtcNow.Date))
            .WithMessage("Appointment date must be today or in the future.");

        RuleFor(x => x.AppointmentTime)
            .NotEmpty()
            .Must(t => TimeOnly.TryParse(t, out _)).WithMessage("AppointmentTime must be in HH:mm format.");

    }
}

public class BookAppointmentcmdHandler : IRequestHandler<BookAppointmentcmd, AppointmentDto>
{
    private readonly IAppointmentRepository _appointments;
    IServiceRepository _serviceRepository;
    private readonly IUserRepository _users;
    private readonly IUnitOfWork _uow;
    private readonly IMapper _mapper;
    private readonly IPublisher _publisher;


    public BookAppointmentcmdHandler(
        IAppointmentRepository appointments,
        IUserRepository users,
        IUnitOfWork uow,
        IMapper mapper,
        IServiceRepository serviceRepository,
        IPublisher publisher)
    {
        _appointments = appointments;
        _users = users;
        _uow = uow;
        _mapper = mapper;
        _serviceRepository = serviceRepository;
        _publisher = publisher;
    }

    public async Task<AppointmentDto> Handle(BookAppointmentcmd cmd, CancellationToken ct)
    {
        // Verify both users exist
        _ = await _users.GetByIdAsync(cmd.PatientId, ct)
            ?? throw new NotFoundException(nameof(User), cmd.PatientId);
        _ = await _users.GetByIdAsync(cmd.DentistId, ct)
            ?? throw new NotFoundException(nameof(User), cmd.DentistId);

        var date = DateOnly.Parse(cmd.AppointmentDate);
        var time = TimeOnly.Parse(cmd.AppointmentTime);

        // Check schedule conflict
        var service = await _serviceRepository.GetByIdAsync(cmd.ServiceId, ct);
        if (service is null)
        {
            throw new InvalidOperationException($"Service with id '{cmd.ServiceId}' was not found.");
        }

        var hasConflict = await _appointments.HasConflictAsync(
            cmd.DentistId,
            date,
            time,
            service.ApproximateDurationMinutes);

        if (hasConflict)
        {
            throw new InvalidOperationException("Appointment time conflicts with an existing appointment.");
        }

        var appointment = Appointment.Book(
            cmd.PatientId,
            cmd.DentistId,
            date,
            time,
            service,
            cmd.CreatedBy,
            cmd.ScheduleId);

        await _appointments.CreateAsync(appointment);
        await _uow.SaveChangesAsync();
        await _publisher.Publish(new SmsNotificationRequestedEvent(
            appointment.Id,
            appointment.PatientId,
            appointment.Patient.PhoneNumber,
            "Appoinment Booked",
            $"Dear {appointment.Patient.FullName}, your appointment has been Booked for {appointment.AppointmentTime}"));
        // Reload with navigation props for mapping
        var created = await _appointments.GetByIdAsync(appointment.Id, ct);
        return _mapper.Map<AppointmentDto>(created!);
    }
}

// ── ManageAppointmentcmd (Receptionist) ───────────────────────────────────

public record ManageAppointmentcmd(
    int AppointmentId,
    string? NewDate,
    string? NewTime,
    string? ServiceName,
    string? Action)   // "confirm" | "reschedule" | "complete"
    : IRequest<AppointmentDto>;

public class ManageAppointmentcmdHandler : IRequestHandler<ManageAppointmentcmd, AppointmentDto>
{
    private readonly IAppointmentRepository _appointments;
    private readonly IUnitOfWork _uow;
    private readonly IMapper _mapper;
    private readonly IPublisher _publisher;


    public ManageAppointmentcmdHandler(
        IAppointmentRepository appointments, IUnitOfWork uow, IMapper mapper, IPublisher publisher)
    {
        _appointments = appointments;
        _uow = uow;
        _mapper = mapper;
        _publisher = publisher;

    }

    public async Task<AppointmentDto> Handle(ManageAppointmentcmd cmd, CancellationToken ct)
    {
        var appointment = await _appointments.GetByIdAsync(cmd.AppointmentId, ct)
            ?? throw new NotFoundException(nameof(Appointment), cmd.AppointmentId);

        switch (cmd.Action?.ToLowerInvariant())
        {
            case "confirm":
                appointment.Confirm();
                await _publisher.Publish(new SmsNotificationRequestedEvent(
                    appointment.Id,
                    appointment.PatientId,
                    appointment.Patient.PhoneNumber,
                    "Appoinment Confirmed",
                    $"Dear {appointment.Patient.FullName}, your appointment has been confirmed for {appointment.AppointmentTime}"));
                break;

            case "reschedule":
                if (cmd.NewDate is null || cmd.NewTime is null)
                    throw new ConflictException("NewDate and NewTime are required for reschedule.");
                appointment.Reschedule(DateOnly.Parse(cmd.NewDate), TimeOnly.Parse(cmd.NewTime));
                await _publisher.Publish(new SmsNotificationRequestedEvent(
                    appointment.Id,
                    appointment.PatientId,
                    appointment.Patient.PhoneNumber,
                    "Appoinment Rescheduled",
                    $"Dear {appointment.Patient.FullName}, your appointment has been rescheduled for {appointment.AppointmentTime}"));
                break;

            case "complete":
                appointment.Complete();
                break;

            default:
                throw new ConflictException($"Unknown action '{cmd.Action}'.");
        }

        await _appointments.UpdateAsync(appointment, ct);
        await _uow.SaveChangesAsync(ct);

        return _mapper.Map<AppointmentDto>(appointment);
    }
}

// ── CancelAppointmentcmd ──────────────────────────────────────────────────

public record CancelAppointmentcmd(int AppointmentId, int RequestingUserId) : IRequest;

public class CancelAppointmentcmdHandler : IRequestHandler<CancelAppointmentcmd>
{
    private readonly IAppointmentRepository _appointments;
    private readonly IUserRepository _users;
    private readonly IUnitOfWork _uow;
    private readonly IPublisher _publisher;

    public CancelAppointmentcmdHandler(
        IAppointmentRepository appointments, IUserRepository users, IUnitOfWork uow, IPublisher publisher)
    {
        _appointments = appointments;
        _users = users;
        _uow = uow;
        _publisher = publisher;
    }

    public async Task Handle(CancelAppointmentcmd cmd, CancellationToken ct)
    {
        var appointment = await _appointments.GetByIdAsync(cmd.AppointmentId, ct)
            ?? throw new NotFoundException(nameof(Appointment), cmd.AppointmentId);

        // Patients can only cancel their own appointments
        var requester = await _users.GetByIdAsync(cmd.RequestingUserId, ct)
            ?? throw new NotFoundException(nameof(User), cmd.RequestingUserId);

        bool isPatient = requester.Role.RoleName == "Patient";
        if (isPatient && appointment.PatientId != cmd.RequestingUserId)
            throw new ForbiddenException("Patients can only cancel their own appointments.");

        appointment.Cancel();  // raises AppointmentCancelledEvent

        await _appointments.UpdateAsync(appointment, ct);
        await _uow.SaveChangesAsync(ct);
        await _publisher.Publish(new SmsNotificationRequestedEvent(
            appointment.Id,
            appointment.PatientId,
            appointment.Patient.PhoneNumber,
            "Appoinment Cancelled",
            $"Dear {appointment.Patient.FullName}, your appointment has been cancelled."));
    }
    private static string BuildMessage(string patientName, string delayMessage)
    => $"Dear {patientName}, your appointment has been scheduled for {delayMessage}";
}
