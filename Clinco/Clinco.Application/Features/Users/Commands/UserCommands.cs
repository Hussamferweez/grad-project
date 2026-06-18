using Application.Common.Exceptions;
using Clinco.Application.Services;
using Domain.Interfaces;
using Domain.Interfaces.Repositories;
using Domain.ValueObjects;
using FluentValidation;
using MediatR;

namespace Application.Features.Users.Commands;

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
