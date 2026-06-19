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
            .ForMember(d => d.FullName,       o => o.MapFrom(s => s.FullName))
            .ForMember(d => d.RoleName,       o => o.MapFrom(s => s.Role.RoleName))
            .ForMember(d => d.DateOfBirth,    o => o.MapFrom(s => s.DateOfBirth.HasValue
                                                    ? s.DateOfBirth.Value.ToString("yyyy-MM-dd")
                                                    : null))
            .ForMember(d => d.Gender,         o => o.MapFrom(s => s.Gender.ToString()))
            .ForMember(d => d.LastLogin,      o => o.MapFrom(s => s.LastLogin));

        CreateMap<User, UserSummaryDto>()
            .ForMember(d => d.FullName,   o => o.MapFrom(s => s.FullName))
            .ForMember(d => d.RoleName,   o => o.MapFrom(s => s.Role.RoleName));

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
            .ForMember(d => d.PatientName, o => o.MapFrom(s => s.Patient.FullName))
            .ForMember(d => d.Status,      o => o.MapFrom(s => s.Status.ToString()));
    }
}
