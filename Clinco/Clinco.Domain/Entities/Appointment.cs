using Domain.Common;
using Domain.Enums;
using Domain.Events;

namespace Domain.Entities;

/// <summary>
/// Appointment aggregate root.
/// All state transitions go through explicit methods so domain rules
/// and events are always enforced in one place.
/// </summary>
public class Appointment : BaseEntity
{
    // ── References ────────────────────────────────────────────────
    public int PatientId { get; private set; }
    public User Patient { get; private set; } = default!;

    public int DentistId { get; private set; }
    public User Dentist { get; private set; } = default!;

    public int? ScheduleId { get; private set; }
    public Schedule? Schedule { get; private set; }
    public int ServiceId { get; private set; }
    public Service Service { get; private set; } = default!;

    // ── Scheduling ────────────────────────────────────────────────
    public DateOnly AppointmentDate { get; private set; }
    public TimeOnly AppointmentTime { get; private set; }
    public int DurationMinutes { get; private set; }

    // ── Clinical ──────────────────────────────────────────────────
    public string ServiceName { get; private set; } = default!;
    public string? TreatmentNotes { get; private set; }

    // ── Delay info ────────────────────────────────────────────────
    public string? DelayReason { get; private set; }
    public int DelayDurationMinutes { get; private set; }

    // ── Status ────────────────────────────────────────────────────
    public AppointmentStatus Status { get; private set; }

    // ── Audit ─────────────────────────────────────────────────────
    public int CreatedBy { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime UpdatedAt { get; private set; }

    // ── Soft delete ───────────────────────────────────────────────
    public bool IsDeleted { get; private set; }

    // ── Navigation ────────────────────────────────────────────────
    public ICollection<SmsNotification> SmsNotifications { get; private set; } = [];

    private Appointment() { }

    // ── Factory ───────────────────────────────────────────────────

    public static Appointment Book(
        int patientId,
        int dentistId,
        DateOnly appointmentDate,
        TimeOnly appointmentTime,
        Service service,
        int createdBy,
        int? scheduleId = null)
    {
        ArgumentNullException.ThrowIfNull(service);

        if (appointmentDate < DateOnly.FromDateTime(DateTime.UtcNow.Date))
            throw new ArgumentException("Cannot book an appointment in the past.");

        if (service.ApproximateDurationMinutes <= 0 || service.ApproximateDurationMinutes > 480)
            throw new ArgumentOutOfRangeException(nameof(service.ApproximateDurationMinutes),
                "Duration must be between 1 and 480 minutes.");

        var now = DateTime.UtcNow;

        var appointment = new Appointment
        {
            PatientId = patientId,
            DentistId = dentistId,
            ScheduleId = scheduleId,
            ServiceId = service.Id,
            AppointmentDate = appointmentDate,
            AppointmentTime = appointmentTime,
            DurationMinutes = service.ApproximateDurationMinutes,
            ServiceName = service.Name,
            Status = AppointmentStatus.Booked,
            CreatedBy = createdBy,
            CreatedAt = now,
            UpdatedAt = now
        };

        appointment.RaiseDomainEvent(new AppointmentBookedEvent(appointment.Id, patientId, dentistId, appointmentDate));
        return appointment;
    }

    // ── State transitions ─────────────────────────────────────────

    public void Confirm()
    {
        EnsureNotCancelled();
        Status = AppointmentStatus.Confirmed;
        UpdatedAt = DateTime.UtcNow;
    }

    public void MarkDelay(string reason, int delayDurationMinutes)
    {
        EnsureNotCancelled();
        EnsureNotCompleted();

        if (delayDurationMinutes <= 0 || delayDurationMinutes > 480)
            throw new ArgumentOutOfRangeException(nameof(delayDurationMinutes),
                "Delay duration must be between 1 and 480 minutes.");

        ArgumentException.ThrowIfNullOrWhiteSpace(reason, nameof(reason));

        DelayReason = reason;
        DelayDurationMinutes = delayDurationMinutes;
        Status = AppointmentStatus.Delayed;
        UpdatedAt = DateTime.UtcNow;

        RaiseDomainEvent(new DelayMarkedEvent(Id, PatientId, DentistId, delayDurationMinutes, reason));
    }

    public void Complete(string? treatmentNotes = null)
    {
        EnsureNotCancelled();

        TreatmentNotes = treatmentNotes;
        Status = AppointmentStatus.Completed;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Cancel()
    {
        EnsureNotCompleted();

        if (Status == AppointmentStatus.Cancelled)
            throw new InvalidOperationException("Appointment is already cancelled.");

        Status = AppointmentStatus.Cancelled;
        UpdatedAt = DateTime.UtcNow;

        RaiseDomainEvent(new AppointmentCancelledEvent(Id, PatientId, DentistId));
    }

    public void Reschedule(DateOnly newDate, TimeOnly newTime)
    {
        EnsureNotCancelled();
        EnsureNotCompleted();

        if (newDate < DateOnly.FromDateTime(DateTime.UtcNow.Date))
            throw new ArgumentException("Cannot reschedule to a past date.");

        AppointmentDate = newDate;
        AppointmentTime = newTime;
        Status = AppointmentStatus.Booked;
        UpdatedAt = DateTime.UtcNow;
    }

    public void AddTreatmentNotes(string notes)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(notes, nameof(notes));
        TreatmentNotes = notes;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SoftDelete()
    {
        IsDeleted = true;
        UpdatedAt = DateTime.UtcNow;
    }

    // ── Guards ────────────────────────────────────────────────────

    private void EnsureNotCancelled()
    {
        if (Status == AppointmentStatus.Cancelled)
            throw new InvalidOperationException("Cannot modify a cancelled appointment.");
    }

    private void EnsureNotCompleted()
    {
        if (Status == AppointmentStatus.Completed)
            throw new InvalidOperationException("Cannot modify a completed appointment.");
    }

    // ── Computed ──────────────────────────────────────────────────

    /// <summary>Estimated end time accounting for any recorded delay.</summary>
    public TimeOnly EstimatedEndTime
        => AppointmentTime.AddMinutes(DurationMinutes + DelayDurationMinutes);

    public bool IsUpcoming
        => AppointmentDate >= DateOnly.FromDateTime(DateTime.UtcNow.Date)
           && Status is AppointmentStatus.Booked or AppointmentStatus.Confirmed;
}
