using Clinco.Domain.Consts;
using Clinco.Domain.Entities;
using Clinco.Domain.ValueObjects;

namespace Clinco.Domain.Factories;

    public interface ISampleEntityFactory
    {
        SampleEntity Create(SampleEntityId id, SampleEntityName name, SampleEntityDestination destination);

        SampleEntity CreateWithDefaultItems(SampleEntityId id, SampleEntityName name, Gender gender,
            SampleEntityDestination destination);
    }

