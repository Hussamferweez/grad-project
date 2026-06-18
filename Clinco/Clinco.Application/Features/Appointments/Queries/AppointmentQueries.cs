using Application.Common.DTOs;
using Application.Common.Exceptions;
using AutoMapper;
using Domain.Interfaces.Repositories;
using MediatR;

namespace Application.Features.Appointments.Queries;

// ── GetAppointmentByIdQuery ───────────────────────────────────────────────────

public record GetAppointmentByIdQuery(int AppointmentId) : IRequest<AppointmentDto>;

public class GetAppointmentByIdQueryHandler : IRequestHandler<GetAppointmentByIdQuery, AppointmentDto>
{
    private readonly IAppointmentRepository _appointments;
    private readonly IMapper _mapper;

    public GetAppointmentByIdQueryHandler(IAppointmentRepository appointments, IMapper mapper)
    {
        _appointments = appointments;
        _mapper = mapper;
    }

    public async Task<AppointmentDto> Handle(GetAppointmentByIdQuery q, CancellationToken ct)
    {
        var appointment = await _appointments.GetByIdAsync(q.AppointmentId, ct)
            ?? throw new NotFoundException(nameof(Domain.Entities.Appointment), q.AppointmentId);

        return _mapper.Map<AppointmentDto>(appointment);
    }
}

// ── GetAppointmentsByPatientQuery ─────────────────────────────────────────────

public record GetAppointmentsByPatientQuery(int PatientId) : IRequest<IReadOnlyList<AppointmentDto>>;

public class GetAppointmentsByPatientQueryHandler
    : IRequestHandler<GetAppointmentsByPatientQuery, IReadOnlyList<AppointmentDto>>
{
    private readonly IAppointmentRepository _appointments;
    private readonly IMapper _mapper;

    public GetAppointmentsByPatientQueryHandler(IAppointmentRepository appointments, IMapper mapper)
    {
        _appointments = appointments;
        _mapper = mapper;
    }

    public async Task<IReadOnlyList<AppointmentDto>> Handle(
        GetAppointmentsByPatientQuery q, CancellationToken ct)
    {
        var list = await _appointments.GetByPatientIdAsync(q.PatientId, ct);
        return _mapper.Map<IReadOnlyList<AppointmentDto>>(list);
    }
}

// ── GetAppointmentsByDateQuery (Doctor / Receptionist view) ───────────────────

public record GetAppointmentsByDateQuery(string Date) : IRequest<IReadOnlyList<AppointmentDto>>;

public class GetAppointmentsByDateQueryHandler
    : IRequestHandler<GetAppointmentsByDateQuery, IReadOnlyList<AppointmentDto>>
{
    private readonly IAppointmentRepository _appointments;
    private readonly IMapper _mapper;

    public GetAppointmentsByDateQueryHandler(IAppointmentRepository appointments, IMapper mapper)
    {
        _appointments = appointments;
        _mapper = mapper;
    }

    public async Task<IReadOnlyList<AppointmentDto>> Handle(
        GetAppointmentsByDateQuery q, CancellationToken ct)
    {
        var date = DateOnly.Parse(q.Date);
        var list = await _appointments.GetByDateAsync(date, ct);
        return _mapper.Map<IReadOnlyList<AppointmentDto>>(list);
    }
}

// ── GetAppointmentsByDentistQuery ─────────────────────────────────────────────

public record GetAppointmentsByDentistQuery(
    int DentistId,
    string? Date = null) : IRequest<IReadOnlyList<AppointmentDto>>;

public class GetAppointmentsByDentistQueryHandler
    : IRequestHandler<GetAppointmentsByDentistQuery, IReadOnlyList<AppointmentDto>>
{
    private readonly IAppointmentRepository _appointments;
    private readonly IMapper _mapper;

    public GetAppointmentsByDentistQueryHandler(IAppointmentRepository appointments, IMapper mapper)
    {
        _appointments = appointments;
        _mapper = mapper;
    }

    public async Task<IReadOnlyList<AppointmentDto>> Handle(
        GetAppointmentsByDentistQuery q, CancellationToken ct)
    {
        var list = q.Date is not null
            ? await _appointments.GetByDentistAndDateAsync(q.DentistId, DateOnly.Parse(q.Date), ct)
            : await _appointments.GetByDentistIdAsync(q.DentistId, ct);

        return _mapper.Map<IReadOnlyList<AppointmentDto>>(list);
    }
}
