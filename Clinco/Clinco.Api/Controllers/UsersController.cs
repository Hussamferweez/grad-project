using API.Common;
using Application.Features.Users.Commands;
using Application.Features.Users.Queries;
using Clinco.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

/// <summary>Manages user profiles and account operations.</summary>
[Authorize]
public class UsersController : BaseApiController
{
    private readonly ICurrentUserService _currentUser;

    public UsersController(ICurrentUserService currentUser)
        => _currentUser = currentUser;

    /// <summary>Returns the authenticated user's full profile.</summary>
    /// <response code="200">Profile returned.</response>
    /// <response code="404">User not found.</response>
    [HttpGet("profile")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetProfile(CancellationToken ct)
    {
        var result = await Mediator.Send(new GetUserProfileQuery(_currentUser.UserId), ct);
        return Ok(ApiResponse<object>.Ok(result));
    }

    /// <summary>Returns the profile of any user by ID. Admin only.</summary>
    [HttpGet("{id:int}")]
    [Authorize(Policy = "AdminOnly")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id, CancellationToken ct)
    {
        var result = await Mediator.Send(new GetUserProfileQuery(id), ct);
        return Ok(ApiResponse<object>.Ok(result));
    }

    /// <summary>Returns all users. Admin only.</summary>
    [HttpGet]
    [Authorize(Policy = "AdminOnly")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var result = await Mediator.Send(new GetAllUsersQuery(), ct);
        return Ok(ApiResponse<object>.Ok(result));
    }

    /// <summary>Returns all users with a given role ID. Admin only.</summary>
    [HttpGet("by-role/{roleId:int}")]
    [Authorize(Policy = "AdminOnly")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetByRole(int roleId, CancellationToken ct)
    {
        var result = await Mediator.Send(new GetUsersByRoleQuery(roleId), ct);
        return Ok(ApiResponse<object>.Ok(result));
    }

    /// <summary>
    /// Returns all users with a given role name (e.g. "Patient", "Doctor").
    /// Clinic staff only — used to populate the booking pickers.
    /// </summary>
    [HttpGet("role/{roleName}")]
    [Authorize(Policy = "ClinicStaff")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetByRoleName(string roleName, CancellationToken ct)
    {
        var result = await Mediator.Send(new GetUsersByRoleNameQuery(roleName), ct);
        return Ok(ApiResponse<object>.Ok(result));
    }

    /// <summary>Creates a patient record for booking and clinic history. Patients still cannot log in.</summary>
    [HttpPost("patients")]
    [Authorize(Policy = "ReceptionistOrAdmin")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    [ProducesResponseType(StatusCodes.Status422UnprocessableEntity)]
    public async Task<IActionResult> CreatePatient(
        [FromBody] CreatePatientRecordCommand command,
        CancellationToken ct)
    {
        var result = await Mediator.Send(command, ct);
        return StatusCode(StatusCodes.Status201Created, ApiResponse<object>.Ok(result));
    }

    /// <summary>Creates a staff account for a doctor or receptionist. Admin only.</summary>
    [HttpPost("staff")]
    [Authorize(Policy = "AdminOnly")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    [ProducesResponseType(StatusCodes.Status422UnprocessableEntity)]
    public async Task<IActionResult> CreateStaff(
        [FromBody] CreateStaffAccountCommand command,
        CancellationToken ct)
    {
        var result = await Mediator.Send(command, ct);
        return StatusCode(StatusCodes.Status201Created, ApiResponse<object>.Ok(result));
    }

    /// <summary>Updates the authenticated user's profile.</summary>
    /// <response code="204">Profile updated.</response>
    /// <response code="422">Validation errors.</response>
    [HttpPut("profile")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status422UnprocessableEntity)]
    public async Task<IActionResult> UpdateProfile(
        [FromBody] UpdateProfileRequest request,
        CancellationToken ct)
    {
        await Mediator.Send(new UpdateUserProfileCommand(
            _currentUser.UserId,
            request.FirstName,
            request.LastName,
            request.PhoneNumber,
            request.Address,
            request.EmergencyContact), ct);

        return NoContent();
    }

    /// <summary>Changes the authenticated user's password.</summary>
    /// <response code="204">Password changed.</response>
    /// <response code="401">Current password is wrong.</response>
    [HttpPut("change-password")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> ChangePassword(
        [FromBody] ChangePasswordRequest request,
        CancellationToken ct)
    {
        await Mediator.Send(new ChangePasswordCommand(
            _currentUser.UserId,
            request.CurrentPassword,
            request.NewPassword), ct);

        return NoContent();
    }
}

// ── Request bodies (kept local — thin wrappers so the command stays clean) ────

public record UpdateProfileRequest(
    string FirstName,
    string LastName,
    string PhoneNumber,
    string? Address,
    string? EmergencyContact);

public record ChangePasswordRequest(
    string CurrentPassword,
    string NewPassword);
