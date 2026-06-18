using Clinco.Shared.Abstractions.Commands;
using Domain.Entities;
using Domain.Interfaces;
using Domain.Interfaces.Repositories;

namespace Clinco.Application.Commands.Handlers;

public sealed class BookAppointmentHandler(
    IAppointmentRepository appointmentRepository,
    IServiceRepository serviceRepository,
    IUnitOfWork unitOfWork) : ICommandHandler<BookAppointment>
{
    public async Task HandleAsync(BookAppointment command)
    {
        var service = await serviceRepository.GetByIdAsync(command.ServiceId);
        if (service is null)
        {
            throw new InvalidOperationException($"Service with id '{command.ServiceId}' was not found.");
        }

        var hasConflict = await appointmentRepository.HasConflictAsync(
            command.DentistId,
            command.AppointmentDate,
            command.AppointmentTime,
            service.ApproximateDurationMinutes);

        if (hasConflict)
        {
            throw new InvalidOperationException("Appointment time conflicts with an existing appointment.");
        }

        var appointment = Appointment.Book(
            command.PatientId,
            command.DentistId,
            command.AppointmentDate,
            command.AppointmentTime,
            service,
            command.CreatedBy,
            command.ScheduleId);

        await appointmentRepository.CreateAsync(appointment);
        await unitOfWork.SaveChangesAsync();
    }
}
