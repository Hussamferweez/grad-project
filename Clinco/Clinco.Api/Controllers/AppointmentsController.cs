using API.Common;
using Clinco.Application.Services;
using Application.Features.Appointments.Queries;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Clinco.Application.Features.Appointments.Commands;

namespace API.Controllers;

/// <summary>Manages dental appointments across all roles.</summary>
[Authorize]
public class AppointmentsController : BaseApiController
{
    private readonly ICurrentUserService _currentUser;

    public AppointmentsController(ICurrentUserService currentUser)
        => _currentUser = currentUser;

    /// <summary>
    /// Books a new appointment. Patient role: PatientId is set from token.
    /// Receptionist/Admin can specify any PatientId.
    /// </summary>
    /// <response code="201">Appointment created.</response>
    /// <response code="409">Time slot conflict.</response>
    //[HttpPost]
    //[Authorize(Policy = "PatientOnly")]
    //[ProducesResponseType(StatusCodes.Status201Created)]
    //[ProducesResponseType(StatusCodes.Status409Conflict)]
    //[ProducesResponseType(StatusCodes.Status422UnprocessableEntity)]
    //public async Task<IActionResult> Book(
    //    [FromBody] BookAppointmentRequest request,
    //    CancellationToken ct)
    //{
    //    // Patient ID is always taken from the JWT — patients cannot book for others
    //    var command = new BookAppointmentcmd(
    //        PatientId:         _currentUser.UserId,
    //        DentistId:         request.DentistId,
    //        AppointmentDate:   request.AppointmentDate,
    //        AppointmentTime:   request.AppointmentTime,
    //        ServiceId:       request.ServiceName,
    //        DurationMinutes:   request.DurationMinutes,
    //        ScheduleId:        request.ScheduleId);

    //    var result = await Mediator.Send(command, ct);
    //    return StatusCode(StatusCodes.Status201Created, ApiResponse<object>.Ok(result));
    //}

    /// <summary>
    /// Books an appointment on behalf of a patient. Receptionist/Admin only.
    /// </summary>
    [HttpPost("manage/book")]
    [Authorize(Policy = "ReceptionistOrAdmin")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> BookForPatient(
        [FromBody] BookAppointmentcmd command,
        CancellationToken ct)
    {
        var result = await Mediator.Send(command, ct);
        return StatusCode(StatusCodes.Status201Created, ApiResponse<object>.Ok(result));
    }

    /// <summary>Returns a single appointment by ID.</summary>
    /// <response code="200">Appointment found.</response>
    /// <response code="404">Not found.</response>
    [HttpGet("{id:int}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id, CancellationToken ct)
    {
        var result = await Mediator.Send(new GetAppointmentByIdQuery(id), ct);
        return Ok(ApiResponse<object>.Ok(result));
    }

    /// <summary>
    /// Returns all appointments for the currently logged-in patient.
    /// </summary>
    [HttpGet("my")]
    [Authorize(Policy = "PatientOnly")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMine(CancellationToken ct)
    {
        var result = await Mediator.Send(
            new GetAppointmentsByPatientQuery(_currentUser.UserId), ct);
        return Ok(ApiResponse<object>.Ok(result));
    }

    /// <summary>
    /// Returns all appointments for a specific patient. Clinic staff only.
    /// </summary>
    [HttpGet("patient/{patientId:int}")]
    [Authorize(Policy = "ClinicStaff")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetByPatient(int patientId, CancellationToken ct)
    {
        var result = await Mediator.Send(new GetAppointmentsByPatientQuery(patientId), ct);
        return Ok(ApiResponse<object>.Ok(result));
    }

    /// <summary>
    /// Returns all appointments on a specific date. Clinic staff only.
    /// </summary>
    /// <param name="date">Date in yyyy-MM-dd format.</param>
    [HttpGet("date/{date}")]
    [Authorize(Policy = "ClinicStaff")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetByDate(string date, CancellationToken ct)
    {
        var result = await Mediator.Send(new GetAppointmentsByDateQuery(date), ct);
        return Ok(ApiResponse<object>.Ok(result));
    }

    /// <summary>
    /// Returns all appointments for a specific dentist, optionally filtered by date.
    /// </summary>
    /// <param name="dentistId">Dentist's user ID.</param>
    /// <param name="date">Optional date filter in yyyy-MM-dd format.</param>
    [HttpGet("dentist/{dentistId:int}")]
    [Authorize(Policy = "ClinicStaff")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetByDentist(
        int dentistId,
        [FromQuery] string? date,
        CancellationToken ct)
    {
        var result = await Mediator.Send(new GetAppointmentsByDentistQuery(dentistId, date), ct);
        return Ok(ApiResponse<object>.Ok(result));
    }

    /// <summary>
    /// Confirms, reschedules, or completes an appointment. Receptionist/Admin only.
    /// Body must include "action": "confirm" | "reschedule" | "complete".
    /// </summary>
    /// <response code="200">Appointment updated.</response>
    /// <response code="404">Not found.</response>
    [HttpPut("{id:int}")]
    [Authorize(Policy = "ReceptionistOrAdmin")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Manage(
        int id,
        [FromBody] ManageAppointmentRequest request,
        CancellationToken ct)
    {
        var result = await Mediator.Send(new ManageAppointmentcmd(
            id,
            request.NewDate,
            request.NewTime,
            request.ServiceName,
            request.Action), ct);

        return Ok(ApiResponse<object>.Ok(result));
    }

    /// <summary>
    /// Cancels an appointment.
    /// Patients can only cancel their own; Receptionist/Admin can cancel any.
    /// </summary>
    /// <response code="204">Cancelled.</response>
    /// <response code="403">Patient trying to cancel someone else's appointment.</response>
    [HttpPatch("{id:int}/cancel")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Cancel(int id, CancellationToken ct)
    {
        await Mediator.Send(new CancelAppointmentcmd(id, _currentUser.UserId), ct);
        return NoContent();
    }
}

// ── Request bodies ─────────────────────────────────────────────────────────────

public record BookAppointmentRequest(
    int DentistId,
    string AppointmentDate,
    string AppointmentTime,
    string ServiceName,
    int DurationMinutes = 30,
    int? ScheduleId = null);

public record ManageAppointmentRequest(
    string Action,
    string? NewDate = null,
    string? NewTime = null,
    string? ServiceName = null);
