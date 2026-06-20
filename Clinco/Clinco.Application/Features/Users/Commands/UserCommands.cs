using Application.Common.DTOs;
using Application.Common.Exceptions;
using Clinco.Application.Services;
using Domain.Entities;
using Domain.Enums;
using Domain.Interfaces;
using Domain.Interfaces.Repositories;
using Domain.ValueObjects;
using FluentValidation;
using MediatR;

namespace Application.Features.Users.Commands;

public record CreateStaffAccountCommand(
    string Username,
    string FirstName,
    string LastName,
    string Email,
    string PhoneNumber,
    string Password,
    string RoleName,
    string? Address,
    string? EmergencyContact) : IRequest<UserSummaryDto>;

public class CreateStaffAccountCommandValidator : AbstractValidator<CreateStaffAccountCommand>
{
    public CreateStaffAccountCommandValidator()
    {
        RuleFor(x => x.Username).NotEmpty().MinimumLength(3).MaximumLength(50);
        RuleFor(x => x.FirstName).NotEmpty().MaximumLength(50);
        RuleFor(x => x.LastName).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.PhoneNumber)
            .NotEmpty()
            .Matches(@"^\+?[0-9]{7,15}$").WithMessage("A valid phone number is required.");
        RuleFor(x => x.Password)
            .NotEmpty()
            .MinimumLength(8)
            .Matches(@"[A-Z]").WithMessage("Password must contain at least one uppercase letter.")
            .Matches(@"[0-9]").WithMessage("Password must contain at least one digit.");
        RuleFor(x => x.RoleName)
            .Must(x => x is "Doctor" or "Receptionist")
            .WithMessage("Role must be Doctor or Receptionist.");
    }
}

public class CreateStaffAccountCommandHandler : IRequestHandler<CreateStaffAccountCommand, UserSummaryDto>
{
    private readonly IUserRepository _users;
    private readonly IRoleRepository _roles;
    private readonly IUnitOfWork _uow;
    private readonly IPasswordHasher _hasher;

    public CreateStaffAccountCommandHandler(
        IUserRepository users,
        IRoleRepository roles,
        IUnitOfWork uow,
        IPasswordHasher hasher)
    {
        _users = users;
        _roles = roles;
        _uow = uow;
        _hasher = hasher;
    }

    public async Task<UserSummaryDto> Handle(CreateStaffAccountCommand cmd, CancellationToken ct)
    {
        var email = Email.Create(cmd.Email);
        var phone = PhoneNumber.Create(cmd.PhoneNumber);

        if (await _users.ExistsAsync(email.Value, phone.Value, ct))
            throw new ConflictException("A user with this email or phone number already exists.");

        if (await _users.GetByUsernameAsync(cmd.Username.Trim(), ct) is not null)
            throw new ConflictException("A user with this username already exists.");

        var role = await _roles.GetByNameAsync(cmd.RoleName, ct)
            ?? throw new NotFoundException(nameof(Role), cmd.RoleName);

        var staff = User.Create(
            cmd.Username,
            _hasher.Hash(cmd.Password),
            cmd.FirstName,
            cmd.LastName,
            email,
            phone,
            role.Id,
            Gender.Other,
            null,
            cmd.Address,
            cmd.EmergencyContact);

        await _users.CreateAsync(staff, ct);
        await _uow.SaveChangesAsync(ct);

        return new UserSummaryDto(staff.Id, staff.FullName, staff.Email, staff.PhoneNumber, role.RoleName, staff.IsActive);
    }
}

public record CreatePatientRecordCommand(
    string FirstName,
    string LastName,
    string PhoneNumber,
    string Gender,
    string? Email,
    int? Age,
    string? DateOfBirth,
    string? Address,
    string? EmergencyContact,
    string? MedicalNotes) : IRequest<UserSummaryDto>;

public class CreatePatientRecordCommandValidator : AbstractValidator<CreatePatientRecordCommand>
{
    public CreatePatientRecordCommandValidator()
    {
        RuleFor(x => x.FirstName).NotEmpty().MaximumLength(50);
        RuleFor(x => x.LastName).NotEmpty().MaximumLength(50);
        RuleFor(x => x.PhoneNumber)
            .NotEmpty()
            .Matches(@"^\+?[0-9]{7,15}$").WithMessage("A valid phone number is required.");
        RuleFor(x => x.Gender)
            .NotEmpty()
            .Must(x => Enum.TryParse<Gender>(x, true, out _))
            .WithMessage("Gender must be Male, Female, or Other.");
        RuleFor(x => x.Email)
            .EmailAddress()
            .When(x => !string.IsNullOrWhiteSpace(x.Email));
        RuleFor(x => x.Age)
            .InclusiveBetween(0, 130)
            .When(x => x.Age.HasValue);
        RuleFor(x => x.DateOfBirth)
            .Must(x => string.IsNullOrWhiteSpace(x) || DateOnly.TryParse(x, out _))
            .WithMessage("Date of birth must be a valid date.");
    }
}

public class CreatePatientRecordCommandHandler : IRequestHandler<CreatePatientRecordCommand, UserSummaryDto>
{
    private readonly IUserRepository _users;
    private readonly IRoleRepository _roles;
    private readonly IUnitOfWork _uow;
    private readonly IPasswordHasher _hasher;

    public CreatePatientRecordCommandHandler(
        IUserRepository users,
        IRoleRepository roles,
        IUnitOfWork uow,
        IPasswordHasher hasher)
    {
        _users = users;
        _roles = roles;
        _uow = uow;
        _hasher = hasher;
    }

    public async Task<UserSummaryDto> Handle(CreatePatientRecordCommand cmd, CancellationToken ct)
    {
        var phone = PhoneNumber.Create(cmd.PhoneNumber);
        var emailValue = string.IsNullOrWhiteSpace(cmd.Email)
            ? $"patient-{Guid.NewGuid():N}@clinico.local"
            : cmd.Email;
        var email = Email.Create(emailValue);

        if (await _users.ExistsAsync(email.Value, phone.Value, ct))
            throw new ConflictException("A patient with this email or phone number already exists.");

        var patientRole = await _roles.GetByNameAsync("Patient", ct)
            ?? throw new NotFoundException(nameof(Role), "Patient");

        var gender = Enum.Parse<Gender>(cmd.Gender, true);
        var dateOfBirth = ResolveDateOfBirth(cmd.DateOfBirth, cmd.Age);
        var username = $"patient-{Guid.NewGuid().ToString("N")[..12]}";

        var patient = User.Create(
            username,
            _hasher.Hash(Guid.NewGuid().ToString("N")),
            cmd.FirstName,
            cmd.LastName,
            email,
            phone,
            patientRole.Id,
            gender,
            dateOfBirth,
            cmd.Address,
            cmd.EmergencyContact);

        if (!string.IsNullOrWhiteSpace(cmd.MedicalNotes))
            patient.AddMedicalNote(cmd.MedicalNotes);

        await _users.CreateAsync(patient, ct);
        await _uow.SaveChangesAsync(ct);

        return new UserSummaryDto(patient.Id, patient.FullName, patient.Email, patient.PhoneNumber, "Patient", patient.IsActive);
    }

    private static DateOnly? ResolveDateOfBirth(string? dateOfBirth, int? age)
    {
        if (!string.IsNullOrWhiteSpace(dateOfBirth))
            return DateOnly.Parse(dateOfBirth);

        if (age is > 0)
            return new DateOnly(DateTime.UtcNow.Year - age.Value, 1, 1);

        return null;
    }
}

// ── UpdateUserProfileCommand ──────────────────────────────────────────────────

public record UpdateUserProfileCommand(
    int UserId,
    string FirstName,
    string LastName,
    string PhoneNumber,
    string? Address,
    string? EmergencyContact) : IRequest;

public class UpdateUserProfileCommandValidator : AbstractValidator<UpdateUserProfileCommand>
{
    public UpdateUserProfileCommandValidator()
    {
        RuleFor(x => x.FirstName).NotEmpty().MaximumLength(50);
        RuleFor(x => x.LastName).NotEmpty().MaximumLength(50);
        RuleFor(x => x.PhoneNumber)
            .NotEmpty()
            .Matches(@"^\+?[0-9]{7,15}$").WithMessage("A valid phone number is required.");
    }
}

public class UpdateUserProfileCommandHandler : IRequestHandler<UpdateUserProfileCommand>
{
    private readonly IUserRepository _users;
    private readonly IUnitOfWork _uow;

    public UpdateUserProfileCommandHandler(IUserRepository users, IUnitOfWork uow)
    {
        _users = users;
        _uow = uow;
    }

    public async Task Handle(UpdateUserProfileCommand cmd, CancellationToken ct)
    {
        var user = await _users.GetByIdAsync(cmd.UserId, ct)
            ?? throw new NotFoundException(nameof(Domain.Entities.User), cmd.UserId);

        var phone = PhoneNumber.Create(cmd.PhoneNumber);

        user.UpdateProfile(cmd.FirstName, cmd.LastName, phone, cmd.Address, cmd.EmergencyContact);

        await _users.UpdateAsync(user, ct);
        await _uow.SaveChangesAsync(ct);
    }
}

// ── ChangePasswordCommand ─────────────────────────────────────────────────────

public record ChangePasswordCommand(
    int UserId,
    string CurrentPassword,
    string NewPassword) : IRequest;

public class ChangePasswordCommandValidator : AbstractValidator<ChangePasswordCommand>
{
    public ChangePasswordCommandValidator()
    {
        RuleFor(x => x.CurrentPassword).NotEmpty();
        RuleFor(x => x.NewPassword)
            .NotEmpty()
            .MinimumLength(8)
            .Matches(@"[A-Z]").WithMessage("New password must contain at least one uppercase letter.")
            .Matches(@"[0-9]").WithMessage("New password must contain at least one digit.")
            .NotEqual(x => x.CurrentPassword).WithMessage("New password must differ from the current password.");
    }
}

public class ChangePasswordCommandHandler : IRequestHandler<ChangePasswordCommand>
{
    private readonly IUserRepository _users;
    private readonly IUnitOfWork _uow;
    private readonly IPasswordHasher _hasher;

    public ChangePasswordCommandHandler(IUserRepository users, IUnitOfWork uow, IPasswordHasher hasher)
    {
        _users = users;
        _uow = uow;
        _hasher = hasher;
    }

    public async Task Handle(ChangePasswordCommand cmd, CancellationToken ct)
    {
        var user = await _users.GetByIdAsync(cmd.UserId, ct)
            ?? throw new NotFoundException(nameof(Domain.Entities.User), cmd.UserId);

        if (!_hasher.Verify(cmd.CurrentPassword, user.PasswordHash))
            throw new UnauthorizedException("Current password is incorrect.");

        user.UpdatePasswordHash(_hasher.Hash(cmd.NewPassword));

        await _users.UpdateAsync(user, ct);
        await _uow.SaveChangesAsync(ct);
    }
}
