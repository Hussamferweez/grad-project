using Clinco.Shared.Abstractions.Commands;
using Domain.Entities;
using Domain.Interfaces;
using Domain.Interfaces.Repositories;

namespace Clinco.Application.Commands.Handlers;

public sealed class CreateServiceHandler(
    IServiceRepository serviceRepository,
    IUnitOfWork unitOfWork) : ICommandHandler<CreateService>
{
    public async Task HandleAsync(CreateService command)
    {
        var existing = await serviceRepository.GetByNameAsync(command.Name);
        if (existing is not null)
        {
            throw new InvalidOperationException($"Service '{command.Name}' already exists.");
        }

        var service = Service.Create(command.Name, command.ApproximateDurationMinutes);
        await serviceRepository.CreateAsync(service);
        await unitOfWork.SaveChangesAsync();
    }
}
