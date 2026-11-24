using MediatR;
using Microsoft.EntityFrameworkCore;
using SupportTicketSystem.Application.Interfaces;
using SupportTicketSystem.Domain.Entities;
using SupportTicketSystem.Domain.Enums;

namespace SupportTicketSystem.Application.Features.Tickets.Queries;

// 1. La consulta recibe opcionalmente el UserId y el Role para filtrar según el rol
public record GetTicketsQuery(Guid? UserId = null, string? UserRole = null) : IRequest<List<Ticket>>;

// 2. El manejador
public class GetTicketsQueryHandler : IRequestHandler<GetTicketsQuery, List<Ticket>>
{
    private readonly IApplicationDbContext _context;

    public GetTicketsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<Ticket>> Handle(GetTicketsQuery request, CancellationToken cancellationToken)
    {
        // Obtenemos la cola global de tickets pendientes ordenados por antigüedad (FIFO)
        var pendingTicketIds = await _context.Tickets
            .Where(t => t.Status != TicketStatus.Resuelto)
            .OrderBy(t => t.CreatedAt)
            .Select(t => t.Id)
            .ToListAsync(cancellationToken);

        var queueMap = pendingTicketIds
            .Select((id, index) => new { id, position = index + 1 })
            .ToDictionary(x => x.id, x => x.position);

        // Si es Admin, pide todos. Si es normal, pide solo los suyos.
        var query = request.UserRole == "Admin"
            ? _context.Tickets.Include(t => t.User).AsQueryable()
            : _context.Tickets.Include(t => t.User).Where(t => request.UserId.HasValue && t.UserId == request.UserId.Value);

        var tickets = await query
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync(cancellationToken);

        foreach (var ticket in tickets)
        {
            ticket.QueuePosition = queueMap.TryGetValue(ticket.Id, out var pos) ? pos : null;
        }

        return tickets;
    }
}