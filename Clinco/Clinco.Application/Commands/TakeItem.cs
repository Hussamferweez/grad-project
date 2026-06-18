using Clinco.Shared.Abstractions.Commands;

namespace Clinco.Application.Commands;

public record TakeItem(Guid sampleEntityId, string Name) : ICommand;
