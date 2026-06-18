using Clinco.Domain.Entities;
using Clinco.Shared.Abstractions.Domains;
using Clinco.Domain.ValueObjects;

namespace Clinco.Domain.Events;

public record SampleEntityItemTaken(SampleEntity sampleEntity, SampleEntityItem sampleEntityItem) : IDomainEvent;

