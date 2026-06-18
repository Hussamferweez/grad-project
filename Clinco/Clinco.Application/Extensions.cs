using Clinco.Domain.Factories;
using Clinco.Domain.Policies;
using Clinco.Shared.Commands;
using Microsoft.Extensions.DependencyInjection;

namespace Clinco.Application;

public static class Extensions
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddCommands();
        services.AddSingleton<ISampleEntityFactory, SampleEntityFactory>();

        services.Scan(b => b.FromAssemblies(typeof(ISampleEntityItemsPolicy).Assembly)
            .AddClasses(c => c.AssignableTo<ISampleEntityItemsPolicy>())
            .AsImplementedInterfaces()
            .WithSingletonLifetime());

        return services;
    }
}

