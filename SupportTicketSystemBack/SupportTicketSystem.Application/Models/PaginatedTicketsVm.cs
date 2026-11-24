using SupportTicketSystem.Domain.Entities;

namespace SupportTicketSystem.Application.Features.Tickets.Queries;

public class PaginatedTicketsVm
{
    public List<Ticket> Items { get; set; } = new();
    public int TotalCount { get; set; }
    public int TotalPages { get; set; }
}