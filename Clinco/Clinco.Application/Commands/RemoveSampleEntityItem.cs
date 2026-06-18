using Clinco.Shared.Abstractions.Commands;

namespace Clinco.Application.Commands;

public record RemoveSampleEntityItem(Guid sampleEntityId, string Name) : ICommand;

