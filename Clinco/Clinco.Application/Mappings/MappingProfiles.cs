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
            .ForMember(d => d.DentistName, o => o.MapFrom(s => s.Dentist.FullName))
            .ForMember(d => d.DayOfWeek,   o => o.MapFrom(s => s.DayOfWeek.ToString()))
            .ForMember(d => d.StartTime,   o => o.MapFrom(s => s.StartTime.ToString("HH:mm")))
            .ForMember(d => d.EndTime,     o => o.MapFrom(s => s.EndTime.ToString("HH:mm")))
            .ForMember(d => d.Date,        o => o.MapFrom(s => s.Date.ToString("yyyy-MM-dd")));

        // ── Appointment ───────────────────────────────────────────
        CreateMap<Appointment, AppointmentDto>()
            .ForMember(d => d.PatientName,       o => o.MapFrom(s => s.Patient.FullName))
            .ForMember(d => d.DentistName,       o => o.MapFrom(s => s.Dentist.FullName))
            .ForMember(d => d.AppointmentDate,   o => o.MapFrom(s => s.AppointmentDate.ToString("yyyy-MM-dd")))
            .ForMember(d => d.AppointmentTime,   o => o.MapFrom(s => s.AppointmentTime.ToString("HH:mm")))
            .ForMember(d => d.Status,            o => o.MapFrom(s => s.Status.ToString()))
            .ForMember(d => d.EstimatedEndTime,  o => o.MapFrom(s => s.EstimatedEndTime.ToString("HH:mm")));

        // ── SmsNotification ───────────────────────────────────────
        CreateMap<SmsNotification, SmsNotificationDto>()
            .ForMember(d => d.PatientName, o => o.MapFrom(s => s.Patient.FullName))
            .ForMember(d => d.Status,      o => o.MapFrom(s => s.Status.ToString()));
    }
}
