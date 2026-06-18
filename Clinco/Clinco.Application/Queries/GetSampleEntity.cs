using Clinco.Application.DTOs;
using Clinco.Shared.Abstractions.Queries;

namespace Clinco.Application.Queries;

public class GetSampleEntity : IQuery<SampleEntityDto>
{
    public Guid Id { get; set; }
}

