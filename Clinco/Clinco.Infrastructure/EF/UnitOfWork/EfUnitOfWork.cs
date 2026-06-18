using Domain.Common;
using Domain.Interfaces;
using Clinco.Infrastructure.EF.Contexts;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Clinco.Infrastructure.EF.UnitOfWork;

internal sealed class EfUnitOfWork(ClinicDbContext dbContext, IPublisher publisher) : IUnitOfWork
{
    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        var domainEvents = dbContext.ChangeTracker
            .Entries<BaseEntity>()
            .SelectMany(entry => entry.Entity.DomainEvents)
            .ToList();

        foreach (var domainEvent in domainEvents)
        {
            await publisher.Publish(domainEvent, cancellationToken);
        }

        foreach (var entity in dbContext.ChangeTracker.Entries<BaseEntity>())
        {
            entity.Entity.ClearDomainEvents();
        }

        return await dbContext.SaveChangesAsync(cancellationToken);
    }
}
