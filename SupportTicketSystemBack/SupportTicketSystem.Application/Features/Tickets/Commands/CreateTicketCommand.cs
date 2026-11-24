using MediatR;
using SupportTicketSystem.Application.Interfaces;
using SupportTicketSystem.Domain.Entities;
using SupportTicketSystem.Domain.Enums;

namespace SupportTicketSystem.Application.Features.Tickets.Commands;

public record CreateTicketCommand(string Title, string Description, Guid UserId) : IRequest<Guid>;

public class CreateTicketCommandHandler : IRequestHandler<CreateTicketCommand, Guid>
{
    private readonly IApplicationDbContext _context;
    private readonly IAIService _aiService;

    public CreateTicketCommandHandler(IApplicationDbContext context, IAIService aiService)
    {
        _context = context;
        _aiService = aiService;
    }

    public async Task<Guid> Handle(CreateTicketCommand request, CancellationToken cancellationToken)
    {
        var (categoria, prioridadString) = await _aiService.AnalyzeTicketAsync(request.Description);

        var prioridadEnum = Enum.TryParse<TicketPriority>(prioridadString, true, out var result)
            ? result
            : TicketPriority.Media;

        var ticket = new Ticket
        {
            Title = request.Title,
            Description = request.Description,
            UserId = request.UserId,
            AICategory = categoria,
            Priority = prioridadEnum
        };

        _context.Tickets.Add(ticket);
        await _context.SaveChangesAsync(cancellationToken);

        return ticket.Id;
    }
}