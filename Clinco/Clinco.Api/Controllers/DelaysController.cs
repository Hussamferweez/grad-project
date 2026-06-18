using API.Common;
using Application.Features.Delays.Commands;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

/// <summary>Allows doctors to mark appointment delays.</summary>
[Authorize(Policy = "DoctorOrAdmin")]
public class DelaysController : BaseApiController
{
    /// <summary>
    /// Marks an appointment as delayed and records the reason and duration.
    /// Raises a domain event that triggers SMS notification to the patient.
    /// </summary>
    /// <response code="200">Delay recorded, appointment DTO returned.</response>
    /// <response code="404">Appointment not found.</response>
    /// <response code="409">Appointment is cancelled or already completed.</response>
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    [ProducesResponseType(StatusCodes.Status422UnprocessableEntity)]
    public async Task<IActionResult> MarkDelay(
        [FromBody] MarkDelayCommand command,
        CancellationToken ct)
    {
        var result = await Mediator.Send(command, ct);
        return Ok(ApiResponse<object>.Ok(result));
    }
}
