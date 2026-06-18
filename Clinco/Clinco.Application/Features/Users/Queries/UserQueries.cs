using Application.Common.DTOs;
using Application.Common.Exceptions;
using AutoMapper;
using Domain.Interfaces.Repositories;
using MediatR;

namespace Application.Features.Users.Queries;

// ── GetUserProfileQuery ───────────────────────────────────────────────────────

public record GetUserProfileQuery(int UserId) : IRequest<UserProfileDto>;

public class GetUserProfileQueryHandler : IRequestHandler<GetUserProfileQuery, UserProfileDto>
{
    private readonly IUserRepository _users;
    private readonly IMapper _mapper;

    public GetUserProfileQueryHandler(IUserRepository users, IMapper mapper)
    {
        _users = users;
        _mapper = mapper;
    }

    public async Task<UserProfileDto> Handle(GetUserProfileQuery q, CancellationToken ct)
    {
        var user = await _users.GetByIdAsync(q.UserId, ct)
            ?? throw new NotFoundException(nameof(Domain.Entities.User), q.UserId);

        return _mapper.Map<UserProfileDto>(user);
    }
}

// ── GetAllUsersQuery (Admin only) ─────────────────────────────────────────────

public record GetAllUsersQuery : IRequest<IReadOnlyList<UserSummaryDto>>;

public class GetAllUsersQueryHandler : IRequestHandler<GetAllUsersQuery, IReadOnlyList<UserSummaryDto>>
{
    private readonly IUserRepository _users;
    private readonly IMapper _mapper;

    public GetAllUsersQueryHandler(IUserRepository users, IMapper mapper)
    {
        _users = users;
        _mapper = mapper;
    }

    public async Task<IReadOnlyList<UserSummaryDto>> Handle(GetAllUsersQuery q, CancellationToken ct)
    {
        var users = await _users.GetAllAsync(ct);
        return _mapper.Map<IReadOnlyList<UserSummaryDto>>(users);
    }
}

// ── GetUsersByRoleQuery ───────────────────────────────────────────────────────

public record GetUsersByRoleQuery(int RoleId) : IRequest<IReadOnlyList<UserSummaryDto>>;

public class GetUsersByRoleQueryHandler : IRequestHandler<GetUsersByRoleQuery, IReadOnlyList<UserSummaryDto>>
{
    private readonly IUserRepository _users;
    private readonly IMapper _mapper;

    public GetUsersByRoleQueryHandler(IUserRepository users, IMapper mapper)
    {
        _users = users;
        _mapper = mapper;
    }

    public async Task<IReadOnlyList<UserSummaryDto>> Handle(GetUsersByRoleQuery q, CancellationToken ct)
    {
        var users = await _users.GetByRoleAsync(q.RoleId, ct);
        return _mapper.Map<IReadOnlyList<UserSummaryDto>>(users);
    }
}

// ── GetUsersByRoleNameQuery (clinic staff — populates booking pickers) ─────────

public record GetUsersByRoleNameQuery(string RoleName) : IRequest<IReadOnlyList<UserSummaryDto>>;

public class GetUsersByRoleNameQueryHandler
    : IRequestHandler<GetUsersByRoleNameQuery, IReadOnlyList<UserSummaryDto>>
{
    private readonly IUserRepository _users;
    private readonly IRoleRepository _roles;

    public GetUsersByRoleNameQueryHandler(IUserRepository users, IRoleRepository roles)
    {
        _users = users;
        _roles = roles;
    }

    public async Task<IReadOnlyList<UserSummaryDto>> Handle(GetUsersByRoleNameQuery q, CancellationToken ct)
    {
        var role = await _roles.GetByNameAsync(q.RoleName, ct);
        if (role is null) return Array.Empty<UserSummaryDto>();

        // GetByRoleAsync is AsNoTracking without the Role navigation, so map manually
        // using the role we already resolved (avoids a null Role reference).
        var users = await _users.GetByRoleAsync(role.Id, ct);
        return users
            .Select(u => new UserSummaryDto(u.Id, u.FullName, u.Email, u.PhoneNumber, role.RoleName, u.IsActive))
            .ToList();
    }
}
