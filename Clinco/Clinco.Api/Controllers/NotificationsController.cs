using API.Common;
using Application.Features.Notifications.Commands;
using Application.Features.Notifications.Queries;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

/// <summary>Manages SMS notifications sent to patients.</summary>
[Authorize]
public class NotificationsController : BaseApiController
{
    /// <summary>
    /// Notifies all booked/confirmed patients on a given date about a delay.
    /// Returns 202 Accepted because SMS sending is async — the count of
    /// patients enqueued is returned immediately.
    /// Receptionist/Admin only.
    /// </summary>
    /// <response code="202">Notifications dispatched. Body contains count of patients notified.</response>
    [HttpPost("notify-delay")]
    [Authorize(Policy = "ReceptionistOrAdmin")]
    [ProducesResponseType(StatusCodes.Status202Accepted)]
    [ProducesResponseType(StatusCodes.Status422UnprocessableEntity)]
    public async Task<IActionResult> NotifyDelay(
        [FromBody] NotifyPatientsForDelayCommand command,
        CancellationToken ct)
    {
        var count = await Mediator.Send(command, ct);
        return StatusCode(
            StatusCodes.Status202Accepted,
            ApiResponse<object>.Ok(new { notified = count }));
    }

    /// <summary>
    /// Returns all SMS notifications sent for a specific appointment.
    /// Clinic staff only.
    /// </summary>
    /// <param name="appointmentId">The appointment ID to look up.</param>
    [HttpGet("appointment/{appointmentId:int}")]
    [Authorize(Policy = "ClinicStaff")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetByAppointment(int appointmentId, CancellationToken ct)
    {
        var result = await Mediator.Send(
            new GetNotificationsByAppointmentQuery(appointmentId), ct);
        return Ok(ApiResponse<object>.Ok(result));
    }

    /// <summary>
    /// Returns all SMS notifications sent to a specific patient.
    /// Clinic staff only.
    /// </summary>
    /// <param name="patientId">The patient's user ID.</param>
    [HttpGet("patient/{patientId:int}")]
    [Authorize(Policy = "ClinicStaff")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetByPatient(int patientId, CancellationToken ct)
    {
        var result = await Mediator.Send(
            new GetNotificationsByPatientQuery(patientId), ct);
        return Ok(ApiResponse<object>.Ok(result));
    }
}
