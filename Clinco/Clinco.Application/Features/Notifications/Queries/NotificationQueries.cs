using Application.Common.DTOs;
using AutoMapper;
using Domain.Interfaces.Repositories;
using MediatR;

namespace Application.Features.Notifications.Queries;

public record GetNotificationsByAppointmentQuery(int AppointmentId)
    : IRequest<IReadOnlyList<SmsNotificationDto>>;

public class GetNotificationsByAppointmentQueryHandler
    : IRequestHandler<GetNotificationsByAppointmentQuery, IReadOnlyList<SmsNotificationDto>>
{
    private readonly ISmsNotificationRepository _notifications;
    private readonly IMapper _mapper;

    public GetNotificationsByAppointmentQueryHandler(
        ISmsNotificationRepository notifications, IMapper mapper)
    {
        _notifications = notifications;
        _mapper = mapper;
    }

    public async Task<IReadOnlyList<SmsNotificationDto>> Handle(
        GetNotificationsByAppointmentQuery q, CancellationToken ct)
    {
        var list = await _notifications.GetByAppointmentIdAsync(q.AppointmentId, ct);
        return _mapper.Map<IReadOnlyList<SmsNotificationDto>>(list);
    }
}

public record GetNotificationsByPatientQuery(int PatientId)
    : IRequest<IReadOnlyList<SmsNotificationDto>>;

public class GetNotificationsByPatientQueryHandler
    : IRequestHandler<GetNotificationsByPatientQuery, IReadOnlyList<SmsNotificationDto>>
{
    private readonly ISmsNotificationRepository _notifications;
    private readonly IMapper _mapper;

    public GetNotificationsByPatientQueryHandler(
        ISmsNotificationRepository notifications, IMapper mapper)
    {
        _notifications = notifications;
        _mapper = mapper;
    }

    public async Task<IReadOnlyList<SmsNotificationDto>> Handle(
        GetNotificationsByPatientQuery q, CancellationToken ct)
    {
        var list = await _notifications.GetByPatientIdAsync(q.PatientId, ct);
        return _mapper.Map<IReadOnlyList<SmsNotificationDto>>(list);
    }
}
