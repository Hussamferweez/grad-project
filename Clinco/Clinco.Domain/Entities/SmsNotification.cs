using Domain.Common;
using Domain.Enums;

namespace Domain.Entities;

/// <summary>
/// Records every SMS notification dispatched by the system.
/// Acts as an audit trail — one row per send attempt.
/// </summary>
public class SmsNotification : BaseEntity
{
    public int AppointmentId { get; private set; }
    public Appointment Appointment { get; private set; } = default!;

    public int PatientId { get; private set; }
    public User Patient { get; private set; } = default!;

    public string PhoneNumber { get; private set; } = default!;
    public string MessageType { get; private set; } = default!;  // e.g. "DelayAlert", "Reminder"
    public string MessageContent { get; private set; } = default!;

    public NotificationStatus Status { get; private set; }

    /// <summary>External message ID returned by the SMS provider (e.g. Twilio SID).</summary>
    public string? ExternalMessageId { get; private set; }

    /// <summary>Reason text when Status == Failed.</summary>
    public string? FailureReason { get; private set; }

    public DateTime CreatedAt { get; private set; }
    public DateTime? SentAt { get; private set; }

    private SmsNotification() { }

    public static SmsNotification Create(
        int appointmentId,
        int patientId,
        string phoneNumber,
        string messageType,
        string messageContent)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(phoneNumber, nameof(phoneNumber));
        ArgumentException.ThrowIfNullOrWhiteSpace(messageType, nameof(messageType));
        ArgumentException.ThrowIfNullOrWhiteSpace(messageContent, nameof(messageContent));

        return new SmsNotification
        {
            AppointmentId = appointmentId,
            PatientId = patientId,
            PhoneNumber = phoneNumber,
            MessageType = messageType,
            MessageContent = messageContent,
            Status = NotificationStatus.Pending,
            CreatedAt = DateTime.UtcNow
        };
    }

    public void MarkSent(string externalMessageId)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(externalMessageId, nameof(externalMessageId));

        Status = NotificationStatus.Sent;
        ExternalMessageId = externalMessageId;
        SentAt = DateTime.UtcNow;
    }

    public void MarkFailed(string reason)
    {
        Status = NotificationStatus.Failed;
        FailureReason = reason;
    }
}
