using Clinco.Application.DTOs;
using Clinco.Shared.Abstractions.Queries;

namespace Clinco.Application.Queries;

public class SearchSampleEntity : IQuery<IEnumerable<SampleEntityDto>>
{
    public string SearchPhrase { get; set; }
}

