using API.Common;
using Application.Features.Auth.Commands;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

/// <summary>Handles patient registration and user login.</summary>
[AllowAnonymous]
public class AuthController : BaseApiController
{
    /// <summary>Registers a new patient account and returns a JWT.</summary>
    /// <response code="201">Registration successful, token returned.</response>
    /// <response code="409">Email or phone number already in use.</response>
    /// <response code="422">Validation errors.</response>
    [HttpPost("register")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    [ProducesResponseType(StatusCodes.Status422UnprocessableEntity)]
    public async Task<IActionResult> Register(
        [FromBody] RegisterPatientCommand command,
        CancellationToken ct)
    {
        var result = await Mediator.Send(command, ct);
        return StatusCode(StatusCodes.Status201Created, ApiResponse<object>.Ok(result));
    }

    /// <summary>Authenticates a user with email/phone + password and returns a JWT.</summary>
    /// <response code="200">Login successful.</response>
    /// <response code="401">Invalid credentials or account inactive.</response>
    [HttpPost("login")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login(
        [FromBody] LoginCommand command,
        CancellationToken ct)
    {
        var result = await Mediator.Send(command, ct);
        return Ok(ApiResponse<object>.Ok(result));
    }
}
