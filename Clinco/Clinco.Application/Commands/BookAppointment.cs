using Clinco.Shared.Abstractions.Commands;

namespace Clinco.Application.Commands;

public record BookAppointment(
    int PatientId,
    int DentistId,
    DateOnly AppointmentDate,
    TimeOnly AppointmentTime,
    int ServiceId,
    int CreatedBy,
    int? ScheduleId = null) : ICommand;
