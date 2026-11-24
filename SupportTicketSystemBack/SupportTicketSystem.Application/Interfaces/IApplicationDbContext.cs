// SupportTicketSystem.Application/Interfaces/IApplicationDbContext.cs
using Microsoft.EntityFrameworkCore;
using SupportTicketSystem.Domain.Entities;

namespace SupportTicketSystem.Application.Interfaces;

public interface IApplicationDbContext
{
    DbSet<Ticket> Tickets { get; }
    DbSet<User> Users { get; }
    DbSet<Comment> Comments { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}