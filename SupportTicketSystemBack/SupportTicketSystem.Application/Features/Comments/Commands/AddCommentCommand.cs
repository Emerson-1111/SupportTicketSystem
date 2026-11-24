using MediatR;
using SupportTicketSystem.Application.Interfaces;
using SupportTicketSystem.Domain.Entities;

namespace SupportTicketSystem.Application.Features.Comments.Commands;

public record AddCommentCommand(Guid TicketId, Guid UserId, string Text) : IRequest<Guid>;

public class AddCommentCommandHandler : IRequestHandler<AddCommentCommand, Guid>
{
    private readonly IApplicationDbContext _context;

    public AddCommentCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(AddCommentCommand request, CancellationToken cancellationToken)
    {
        var comment = new Comment
        {
            TicketId = request.TicketId,
            UserId = request.UserId,
            Text = request.Text
        };

        _context.Comments.Add(comment);
        await _context.SaveChangesAsync(cancellationToken);

        return comment.Id;
    }
}