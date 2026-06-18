using Domain.Common;

namespace Domain.Entities;

/// <summary>
/// Represents a dentist's working schedule slot for a specific day.
/// The clinic can mark slots available/unavailable independently of appointments.
/// </summary>
public class Schedule : BaseEntity
{
    public int DentistId { get; private set; }
    public User Dentist { get; private set; } = default!;

    public DayOfWeek DayOfWeek { get; private set; }
    public TimeOnly StartTime { get; private set; }
    public TimeOnly EndTime { get; private set; }
    public bool IsAvailable { get; private set; }

    /// <summary>
    /// Concrete calendar date this schedule entry applies to.
    /// Allows per-day overrides (e.g. a holiday on a normally working Wednesday).
    /// </summary>
    public DateOnly Date { get; private set; }

    // Navigation
    public ICollection<Appointment> Appointments { get; private set; } = [];

    private Schedule() { }

    public static Schedule Create(
        int dentistId,
        DayOfWeek dayOfWeek,
        TimeOnly startTime,
        TimeOnly endTime,
        DateOnly date,
        bool isAvailable = true)
    {
        if (endTime <= startTime)
            throw new ArgumentException("End time must be after start time.");

        return new Schedule
        {
            DentistId = dentistId,
            DayOfWeek = dayOfWeek,
            StartTime = startTime,
            EndTime = endTime,
            Date = date,
            IsAvailable = isAvailable
        };
    }

    public void SetAvailability(bool isAvailable)
        => IsAvailable = isAvailable;

    public void UpdateTimeSlot(TimeOnly startTime, TimeOnly endTime)
    {
        if (endTime <= startTime)
            throw new ArgumentException("End time must be after start time.");

        StartTime = startTime;
        EndTime = endTime;
    }

    /// <summary>Returns total working minutes for this schedule slot.</summary>
    public int DurationMinutes
        => (int)(EndTime.ToTimeSpan() - StartTime.ToTimeSpan()).TotalMinutes;
}
