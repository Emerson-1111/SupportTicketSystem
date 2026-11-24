using System.ComponentModel.DataAnnotations.Schema;
using SupportTicketSystem.Domain.Enums;

namespace SupportTicketSystem.Domain.Entities;

public class Ticket
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;

    // Aquí es donde la IA inyectará sus resultados
    public string AICategory { get; set; } = string.Empty;
    public TicketPriority Priority { get; set; } = TicketPriority.Baja;

    public TicketStatus Status { get; set; } = TicketStatus.Abierto;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Turno en la fila de atención (calculado dinámicamente para tickets pendientes)
    [NotMapped]
    public int? QueuePosition { get; set; }

    // Relaciones
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public ICollection<Comment> Comments { get; set; } = new List<Comment>();
}