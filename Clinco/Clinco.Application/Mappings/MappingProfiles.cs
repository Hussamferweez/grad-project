using Application.Common.DTOs;
using AutoMapper;
using Domain.Entities;

namespace Application.Common.Mappings;

public class MappingProfiles : Profile
{
    public MappingProfiles()
    {
        // ── User ──────────────────────────────────────────────────
        CreateMap<User, UserProfileDto>()
            .ConstructUsing(s => new UserProfileDto(
                s.Id,
                s.Username,
                s.FirstName,
                s.LastName,
                s.FullName,
                s.Email,
                s.PhoneNumber,
                s.DateOfBirth.HasValue ? s.DateOfBirth.Value.ToString("yyyy-MM-dd") : null,
                s.Gender.ToString(),
                s.Address,
                s.EmergencyContact,
                s.MedicalNotes,
                s.Role != null ? s.Role.RoleName : string.Empty,
                s.IsActive,
                s.RegistrationDate,
                s.LastLogin
            ));

        CreateMap<User, UserSummaryDto>()
            .ConstructUsing(s => new UserSummaryDto(
                s.Id,
                s.FullName,
                s.Email,
                s.PhoneNumber,
                s.Role != null ? s.Role.RoleName : string.Empty,
                s.IsActive
            ));

        // ── Schedule ──────────────────────────────────────────────
        CreateMap<Schedule, ScheduleDto>()
            .ConstructUsing(s => new ScheduleDto(
                s.Id,
                s.DentistId,
                s.Dentist != null ? s.Dentist.FullName : null,
                s.DayOfWeek.ToString(),
                s.StartTime.ToString("HH:mm"),
                s.EndTime.ToString("HH:mm"),
                s.IsAvailable,
                s.Date.ToString("yyyy-MM-dd")
            ));

        // ── Appointment ───────────────────────────────────────────
        CreateMap<Appointment, AppointmentDto>()
            .ConstructUsing(s => new AppointmentDto(
                s.Id,
                s.PatientId,
                s.Patient != null ? s.Patient.FullName : null,
                s.DentistId,
                s.Dentist != null ? s.Dentist.FullName : null,
                s.AppointmentDate.ToString("yyyy-MM-dd"),
                s.AppointmentTime.ToString("HH:mm"),
                s.DurationMinutes,
                s.Service != null ? s.Service.Name : null,
                s.Status.ToString(),
                s.TreatmentNotes,
                s.DelayReason,
                s.DelayDurationMinutes,
                s.EstimatedEndTime.ToString("HH:mm"),
                s.CreatedAt,
                s.UpdatedAt
            ));

        // ── SmsNotification ───────────────────────────────────────
        CreateMap<SmsNotification, SmsNotificationDto>()
            .ConstructUsing(s => new SmsNotificationDto(
                s.Id,
                s.AppointmentId,
                s.PatientId,
                s.Patient != null ? s.Patient.FullName : string.Empty,
                s.PhoneNumber,
                s.MessageType,
                s.MessageContent,
                s.Status.ToString(),
                s.ExternalMessageId,
                s.FailureReason,
                s.CreatedAt,
                s.SentAt
            ));
    }
}
