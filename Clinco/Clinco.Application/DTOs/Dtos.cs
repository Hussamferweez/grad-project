using Domain.Enums;

namespace Application.Common.DTOs;

// ── Auth ──────────────────────────────────────────────────────────────────────

public record AuthResponse(
    string AccessToken,
    DateTime ExpiresAt,
    int UserId,
    string FullName,
    string Email,
    string Role);

// ── User ──────────────────────────────────────────────────────────────────────

public record UserProfileDto(
    int Id,
    string Username,
    string FirstName,
    string LastName,
    string FullName,
    string Email,
    string PhoneNumber,
    string? DateOfBirth,
    string Gender,
    string? Address,
    string? EmergencyContact,
    string? MedicalNotes,
    string RoleName,
    bool IsActive,
    DateTime RegistrationDate,
    DateTime? LastLogin);

public record UserSummaryDto(
    int Id,
    string FullName,
    string Email,
    string PhoneNumber,
    string RoleName,
    bool IsActive);

// ── Schedule ──────────────────────────────────────────────────────────────────

public record ScheduleDto(
    int Id,
    int DentistId,
    string DentistName,
    string DayOfWeek,
    string StartTime,
    string EndTime,
    bool IsAvailable,
    string Date);

// ── Appointment ───────────────────────────────────────────────────────────────

public record AppointmentDto(
    int Id,
    int PatientId,
    string PatientName,
    int DentistId,
    string DentistName,
    string AppointmentDate,
    string AppointmentTime,
    int DurationMinutes,
    string ServiceName,
    string Status,
    string? TreatmentNotes,
    string? DelayReason,
    int DelayDurationMinutes,
    string EstimatedEndTime,
    DateTime CreatedAt,
    DateTime UpdatedAt);

// ── SMS Notification ──────────────────────────────────────────────────────────

public record SmsNotificationDto(
    int Id,
    int AppointmentId,
    int PatientId,
    string PatientName,
    string PhoneNumber,
    string MessageType,
    string MessageContent,
    string Status,
    string? ExternalMessageId,
    string? FailureReason,
    DateTime CreatedAt,
    DateTime? SentAt);
