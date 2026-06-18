using Clinco.Domain.Consts;
using Clinco.Shared.Abstractions.Commands;

namespace Clinco.Application.Commands;

public record CreateSampleEntityWithItems(Guid Id, string Name, Gender Gender,
   DestinationWriteModel Destionation) : ICommand;

public record DestinationWriteModel(string City, string Country);

