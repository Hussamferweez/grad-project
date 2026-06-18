using Application.Common.DTOs;
using Application.Common.Exceptions;
using Clinco.Application.Services;
using Domain.Entities;
using Domain.Interfaces;
using Domain.Interfaces.Repositories;
using Domain.ValueObjects;
using FluentValidation;
using MediatR;

namespace Application.Features.Auth.Commands;

// ── Command ───────────────────────────────────────────────────────────────────

public record RegisterPatientCommand(
    string Username,
    string FirstName,
    string LastName,
    string Email,
    string PhoneNumber,
    string Password,
    string? DateOfBirth,
    string? Address) : IRequest<AuthResponse>;

// ── Validator ─────────────────────────────────────────────────────────────────

public class RegisterPatientCommandValidator : AbstractValidator<RegisterPatientCommand>
{
    public RegisterPatientCommandValidator()
    {
        RuleFor(x => x.Username)
            .NotEmpty().WithMessage("Username is required.")
            .MinimumLength(3).MaximumLength(50);

        RuleFor(x => x.FirstName)
            .NotEmpty().MaximumLength(50);

        RuleFor(x => x.LastName)
            .NotEmpty().MaximumLength(50);

        RuleFor(x => x.Email)
            .NotEmpty()
            .EmailAddress().WithMessage("A valid email address is required.");

        RuleFor(x => x.PhoneNumber)
            .NotEmpty()
            .Matches(@"^\+?[0-9]{7,15}$").WithMessage("A valid phone number is required.");

        RuleFor(x => x.Password)
            .NotEmpty()
            .MinimumLength(8).WithMessage("Password must be at least 8 characters.")
            .Matches(@"[A-Z]").WithMessage("Password must contain at least one uppercase letter.")
            .Matches(@"[0-9]").WithMessage("Password must contain at least one digit.");
    }
}

// ── Handler ───────────────────────────────────────────────────────────────────

public class RegisterPatientCommandHandler : IRequestHandler<RegisterPatientCommand, AuthResponse>
{
    private readonly IUserRepository _users;
    private readonly IRoleRepository _roles;
    private readonly IUnitOfWork _uow;
    private readonly IPasswordHasher _hasher;
    private readonly IJwtTokenGenerator _jwt;

    public RegisterPatientCommandHandler(
        IUserRepository users,
        IRoleRepository roles,
        IUnitOfWork uow,
        IPasswordHasher hasher,
        IJwtTokenGenerator jwt)
    {
        _users = users;
        _roles = roles;
        _uow = uow;
        _hasher = hasher;
        _jwt = jwt;
    }

    public async Task<AuthResponse> Handle(RegisterPatientCommand cmd, CancellationToken ct)
    {
        // 1. Uniqueness check
        if (await _users.ExistsAsync(cmd.Email, cmd.PhoneNumber, ct))
            throw new ConflictException("A user with this email or phone number already exists.");

        // 2. Resolve Patient role (seeded, always exists)
        var patientRole = await _roles.GetByNameAsync("Patient", ct)
            ?? throw new NotFoundException(nameof(Domain.Entities.Role), "Patient");

        // 3. Build value objects (throws if format is invalid)
        var email = Email.Create(cmd.Email);
        var phone = PhoneNumber.Create(cmd.PhoneNumber);

        // 4. Hash password
        var hash = _hasher.Hash(cmd.Password);

        // 5. Create aggregate
        DateOnly? dob = cmd.DateOfBirth is not null
            ? DateOnly.Parse(cmd.DateOfBirth)
            : null;

        var user = User.Create(
            cmd.Username, hash,
            cmd.FirstName, cmd.LastName,
            email, phone,
            patientRole.Id,
            dateOfBirth: dob,
            address: cmd.Address);

        await _users.CreateAsync(user, ct);
        await _uow.SaveChangesAsync(ct);

        // 6. Issue token
        var accessToken = _jwt.GenerateToken(user);

        return new AuthResponse(
            accessToken,
            _jwt.GetAccessTokenExpiry(),
            user.Id, user.FullName, user.Email,
            patientRole.RoleName);
    }
}
