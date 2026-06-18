using System.Reflection;
using Clinco.Application.Services;
using Clinco.Infrastructure.Auth;
using Clinco.Infrastructure.EF;
using Clinco.Infrastructure.EF.Seeding;
using Clinco.Infrastructure.Logging;
using Clinco.Infrastructure.Services;
using Clinco.Infrastructure.Sms;
using Clinco.Shared.Abstractions.Commands;
using Clinco.Shared.Queries;
using MediatR;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Clinco.Infrastructure;

public static class Extensions
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddSQLDB(configuration);
        services.AddQueries();
        services.AddSerilog(configuration);
        services.Configure<JwtOptions>(configuration.GetSection("Jwt"));
        services.Configure<SmsOptions>(configuration.GetSection("Sms"));
        services.AddScoped<IJwtTokenGenerator, JwtTokenGenerator>();
        services.AddScoped<IPasswordHasher, PasswordHasher>();
        services.AddHostedService<DataSeeder>();
        services.AddHttpClient<ISmsGateway, HttpSmsGateway>();
        services.AddMediatR(cfg =>
            cfg.RegisterServicesFromAssemblies(
                Assembly.GetExecutingAssembly(),
                typeof(Clinco.Application.Extensions).Assembly));
        services.TryDecorate(typeof(ICommandHandler<>), typeof(LoggingCommandHandlerDecorator<>));

        return services;
    }
}

