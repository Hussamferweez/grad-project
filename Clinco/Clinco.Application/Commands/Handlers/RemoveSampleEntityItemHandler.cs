using Clinco.Application.Exceptions;
using Clinco.Domain.Repositories;
using Clinco.Shared.Abstractions.Commands;

namespace Clinco.Application.Commands.Handlers;

internal sealed class RemoveSampleEntityItemHandler : ICommandHandler<RemoveSampleEntityItem>
{
    private readonly ISampleEntityRepository _repository;

    public RemoveSampleEntityItemHandler(ISampleEntityRepository repository)
        => _repository = repository;

    public async Task HandleAsync(RemoveSampleEntityItem command)
    {
        var sampleEntity = await _repository.GetAsync(command.sampleEntityId);

        if (sampleEntity is null)
        {
            throw new SampleEntityNotFound(command.sampleEntityId);
        }

        sampleEntity.RemoveItem(command.Name);

        await _repository.UpdateAsync(sampleEntity);
    }
}


