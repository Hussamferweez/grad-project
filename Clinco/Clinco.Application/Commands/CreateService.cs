using Clinco.Shared.Abstractions.Commands;

namespace Clinco.Application.Commands;

public record CreateService(string Name, int ApproximateDurationMinutes) : ICommand;
