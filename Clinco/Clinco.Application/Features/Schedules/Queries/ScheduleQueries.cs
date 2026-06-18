using Application.Common.DTOs;
using AutoMapper;
using Domain.Interfaces.Repositories;
using MediatR;

namespace Application.Features.Schedules.Queries;

// ── GetDentistScheduleQuery ───────────────────────────────────────────────────

public record GetDentistScheduleQuery(
    int DentistId,
    string From,
    string To) : IRequest<IReadOnlyList<ScheduleDto>>;

public class GetDentistScheduleQueryHandler
    : IRequestHandler<GetDentistScheduleQuery, IReadOnlyList<ScheduleDto>>
{
    private readonly IScheduleRepository _schedules;
    private readonly IMapper _mapper;

    public GetDentistScheduleQueryHandler(IScheduleRepository schedules, IMapper mapper)
    {
        _schedules = schedules;
        _mapper = mapper;
    }

    public async Task<IReadOnlyList<ScheduleDto>> Handle(GetDentistScheduleQuery q, CancellationToken ct)
    {
        var from = DateOnly.Parse(q.From);
        var to   = DateOnly.Parse(q.To);

        var schedules = await _schedules.GetByDentistAndDateRangeAsync(q.DentistId, from, to, ct);
        return _mapper.Map<IReadOnlyList<ScheduleDto>>(schedules);
    }
}

// ── GetAvailableSlotsQuery ────────────────────────────────────────────────────

/// <summary>
/// Returns all available schedule slots in a date range — used by
/// the patient's booking calendar to show which days/dentists are open.
/// </summary>
public record GetAvailableSlotsQuery(string From, string To) : IRequest<IReadOnlyList<ScheduleDto>>;

public class GetAvailableSlotsQueryHandler
    : IRequestHandler<GetAvailableSlotsQuery, IReadOnlyList<ScheduleDto>>
{
    private readonly IScheduleRepository _schedules;
    private readonly IMapper _mapper;

    public GetAvailableSlotsQueryHandler(IScheduleRepository schedules, IMapper mapper)
    {
        _schedules = schedules;
        _mapper = mapper;
    }

    public async Task<IReadOnlyList<ScheduleDto>> Handle(GetAvailableSlotsQuery q, CancellationToken ct)
    {
        var from = DateOnly.Parse(q.From);
        var to   = DateOnly.Parse(q.To);

        var slots = await _schedules.GetAvailableSlotsAsync(from, to, ct);
        return _mapper.Map<IReadOnlyList<ScheduleDto>>(slots);
    }
}
