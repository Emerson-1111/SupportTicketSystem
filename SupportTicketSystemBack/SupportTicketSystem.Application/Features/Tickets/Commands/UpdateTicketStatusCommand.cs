using MediatR;
using SupportTicketSystem.Application.Interfaces;
using SupportTicketSystem.Domain.Enums;

namespace SupportTicketSystem.Application.Features.Tickets.Commands;

// Asumimos que Status es un entero: 0 = Abierto, 1 = En Progreso, 2 = Resuelto
public record UpdateTicketStatusCommand(Guid TicketId, int Status) : IRequest<bool>;

public class UpdateTicketStatusCommandHandler : IRequestHandler<UpdateTicketStatusCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public UpdateTicketStatusCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(UpdateTicketStatusCommand request, CancellationToken cancellationToken)
    {
        var ticket = await _context.Tickets.FindAsync(new object[] { request.TicketId }, cancellationToken);

        if (ticket == null) return false;

        ticket.Status = (TicketStatus)request.Status;

        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }
}