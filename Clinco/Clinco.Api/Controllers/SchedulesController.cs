using API.Common;
using Application.Features.Schedules.Commands;
using Application.Features.Schedules.Queries;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

/// <summary>Manages dentist working schedules.</summary>
[Authorize]
public class SchedulesController : BaseApiController
{
    /// <summary>
    /// Creates a schedule slot for a dentist on a specific date.
    /// Admin or Doctor only.
    /// </summary>
    /// <response code="201">Schedule created, returns new schedule ID.</response>
    /// <response code="409">A schedule for this dentist on this date already exists.</response>
    [HttpPost]
    [Authorize(Policy = "DoctorOrAdmin")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    [ProducesResponseType(StatusCodes.Status422UnprocessableEntity)]
    public async Task<IActionResult> Create(
        [FromBody] CreateScheduleCommand command,
        CancellationToken ct)
    {
        var id = await Mediator.Send(command, ct);
        return StatusCode(StatusCodes.Status201Created, ApiResponse<object>.Ok(new { id }));
    }

    /// <summary>
    /// Returns all schedule slots for a specific dentist within a date range.
    /// </summary>
    /// <param name="dentistId">The dentist's user ID.</param>
    /// <param name="from">Start date in yyyy-MM-dd format.</param>
    /// <param name="to">End date in yyyy-MM-dd format.</param>
    [HttpGet("dentist/{dentistId:int}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetByDentist(
        int dentistId,
        [FromQuery] string from,
        [FromQuery] string to,
        CancellationToken ct)
    {
        var result = await Mediator.Send(new GetDentistScheduleQuery(dentistId, from, to), ct);
        return Ok(ApiResponse<object>.Ok(result));
    }

    /// <summary>
    /// Returns all available (open) schedule slots within a date range.
    /// Used by patients to see which days/dentists have open slots.
    /// </summary>
    /// <param name="from">Start date in yyyy-MM-dd format.</param>
    /// <param name="to">End date in yyyy-MM-dd format.</param>
    [HttpGet("available")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAvailable(
        [FromQuery] string from,
        [FromQuery] string to,
        CancellationToken ct)
    {
        var result = await Mediator.Send(new GetAvailableSlotsQuery(from, to), ct);
        return Ok(ApiResponse<object>.Ok(result));
    }

    /// <summary>
    /// Toggles whether a schedule slot is available for booking.
    /// Admin only.
    /// </summary>
    /// <response code="204">Availability updated.</response>
    /// <response code="404">Schedule not found.</response>
    [HttpPatch("{id:int}/availability")]
    [Authorize(Policy = "AdminOnly")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateAvailability(
        int id,
        [FromBody] UpdateAvailabilityRequest request,
        CancellationToken ct)
    {
        await Mediator.Send(new UpdateScheduleAvailabilityCommand(id, request.IsAvailable), ct);
        return NoContent();
    }
}

public record UpdateAvailabilityRequest(bool IsAvailable);
