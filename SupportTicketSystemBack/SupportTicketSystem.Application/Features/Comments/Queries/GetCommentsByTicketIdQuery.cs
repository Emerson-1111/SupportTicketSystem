using MediatR;
using Microsoft.EntityFrameworkCore;
using SupportTicketSystem.Application.Interfaces;
using SupportTicketSystem.Domain.Entities;

namespace SupportTicketSystem.Application.Features.Comments.Queries;

public record GetCommentsByTicketIdQuery(Guid TicketId) : IRequest<List<Comment>>;

public class GetCommentsByTicketIdQueryHandler : IRequestHandler<GetCommentsByTicketIdQuery, List<Comment>>
{
    private readonly IApplicationDbContext _context;

    public GetCommentsByTicketIdQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<Comment>> Handle(GetCommentsByTicketIdQuery request, CancellationToken cancellationToken)
    {
        // Traemos los comentarios ordenados cronológicamente (los más antiguos primero, como en un chat)
        return await _context.Comments
            .Include(c => c.User)
            .Where(c => c.TicketId == request.TicketId)
            .OrderBy(c => c.CreatedAt)
            .ToListAsync(cancellationToken);
    }
}