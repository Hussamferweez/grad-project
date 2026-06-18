using Clinco.Shared.Abstractions.Commands;

namespace Clinco.Application.Commands.Handlers;

public record AddSampleEntityItem(Guid sampleEntityId, string Name, uint Quantity) : ICommand;

