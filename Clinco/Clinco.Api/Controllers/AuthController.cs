using API.Common;
using Application.Features.Auth.Commands;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

/// <summary>Handles clinic staff login.</summary>
[AllowAnonymous]
public class AuthController : BaseApiController
{
    /// <summary>Authenticates a doctor or receptionist with email/phone + password and returns a JWT.</summary>
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
