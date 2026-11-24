using System.Text.Json.Serialization;

namespace SupportTicketSystem.Domain.Entities;

public class User
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = "User";

    [JsonIgnore]
    public string Password { get; set; } = string.Empty;

    // Relación: Un usuario puede tener muchos tickets creados
    [JsonIgnore]
    public ICollection<Ticket> Tickets { get; set; } = new List<Ticket>();
}