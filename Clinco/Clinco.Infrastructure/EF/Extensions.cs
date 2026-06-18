using Clinco.Application.Services;
using Clinco.Domain.Repositories;
using Clinco.Infrastructure.EF.Contexts;
using Clinco.Infrastructure.EF.Options;
using Clinco.Infrastructure.EF.Repositories;
using Clinco.Infrastructure.EF.UnitOfWork;
using Clinco.Shared.Options;
using Domain.Interfaces;
using Domain.Interfaces.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Clinco.Infrastructure.EF;

internal static class Extensions
{
    public static IServiceCollection AddSQLDB(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IRoleRepository, RoleRepository>();
        services.AddScoped<IServiceRepository, ServiceRepository>();
        services.AddScoped<IScheduleRepository, ScheduleRepository>();
        services.AddScoped<IAppointmentRepository, AppointmentRepository>();
        services.AddScoped<ISmsNotificationRepository, SmsNotificationRepository>();
        services.AddScoped<IUnitOfWork, EfUnitOfWork>();

        var options = configuration.GetOptions<DataBaseOptions>("DataBaseConnectionString");
        //services.AddDbContext<ReadDbContext>(ctx =>
        //ctx.UseSqlServer(options.ConnectionString));

        //services.AddDbContext<WriteDbContext>(ctx =>
        //    ctx.UseSqlServer(options.ConnectionString));

        services.AddDbContext<ClinicDbContext>(ctx =>
            ctx.UseSqlServer(options.ConnectionString));

        return services;
    }
}

