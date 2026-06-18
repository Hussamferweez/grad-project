using Clinco.Shared.Abstractions.Commands;

namespace Clinco.Application.Commands;

public record RemoveSampleEntity(Guid Id) : ICommand;

