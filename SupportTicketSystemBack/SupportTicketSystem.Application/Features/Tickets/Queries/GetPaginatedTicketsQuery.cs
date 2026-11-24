using MediatR;
using Microsoft.EntityFrameworkCore;
using SupportTicketSystem.Application.Interfaces;
using SupportTicketSystem.Domain.Enums;

namespace SupportTicketSystem.Application.Features.Tickets.Queries;

public record GetPaginatedTicketsQuery(int Page, int PageSize, Guid? UserId = null, string? UserRole = null) : IRequest<PaginatedTicketsVm>;

public class GetPaginatedTicketsQueryHandler : IRequestHandler<GetPaginatedTicketsQuery, PaginatedTicketsVm>
{
    private readonly IApplicationDbContext _context;

    public GetPaginatedTicketsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<PaginatedTicketsVm> Handle(GetPaginatedTicketsQuery request, CancellationToken cancellationToken)
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

        var totalCount = await query.CountAsync(cancellationToken);
        var totalPages = (int)Math.Ceiling(totalCount / (double)request.PageSize);

        var items = await query
            .OrderByDescending(t => t.CreatedAt) // Los más recientes primero
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);

        foreach (var ticket in items)
        {
            ticket.QueuePosition = queueMap.TryGetValue(ticket.Id, out var pos) ? pos : null;
        }

        return new PaginatedTicketsVm
        {
            Items = items,
            TotalCount = totalCount,
            TotalPages = totalPages
        };
    }
}