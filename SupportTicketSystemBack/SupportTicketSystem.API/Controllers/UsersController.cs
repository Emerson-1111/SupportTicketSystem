using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SupportTicketSystem.Application.Interfaces;
using System.Security.Claims;

namespace SupportTicketSystem.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class UsersController : ControllerBase
{
    private readonly IApplicationDbContext _context;

    public UsersController(IApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetUsers(CancellationToken cancellationToken)
    {
        var users = await _context.Users
            .Select(u => new
            {
                id = u.Id,
                name = u.Name,
                email = u.Email,
                role = u.Role,
                ticketsCount = u.Tickets.Count
            })
            .OrderBy(u => u.name)
            .ToListAsync(cancellationToken);

        return Ok(users);
    }

    [HttpPut("{id}/role")]
    public async Task<IActionResult> UpdateRole(Guid id, [FromBody] UpdateUserRoleRequest request, CancellationToken cancellationToken)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == id, cancellationToken);
        if (user == null)
        {
            return NotFound("Usuario no encontrado.");
        }

        user.Role = request.Role == "Admin" ? "Admin" : "User";
        await _context.SaveChangesAsync(cancellationToken);

        return Ok(new { id = user.Id, role = user.Role, message = "Rol actualizado correctamente." });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUser(Guid id, CancellationToken cancellationToken)
    {
        var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (currentUserId != null && Guid.TryParse(currentUserId, out var parsedCurrentId) && parsedCurrentId == id)
        {
            return BadRequest("No puedes eliminar tu propio usuario con el que tienes sesión activa.");
        }

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == id, cancellationToken);
        if (user == null)
        {
            return NotFound("Usuario no encontrado.");
        }

        // Eliminar comentarios y tickets asociados para respetar llaves foráneas
        var userComments = await _context.Comments.Where(c => c.UserId == id).ToListAsync(cancellationToken);
        _context.Comments.RemoveRange(userComments);

        var userTickets = await _context.Tickets.Where(t => t.UserId == id).ToListAsync(cancellationToken);
        if (userTickets.Any())
        {
            var ticketIds = userTickets.Select(t => t.Id).ToList();
            var ticketComments = await _context.Comments.Where(c => ticketIds.Contains(c.TicketId)).ToListAsync(cancellationToken);
            _context.Comments.RemoveRange(ticketComments);
            _context.Tickets.RemoveRange(userTickets);
        }

        _context.Users.Remove(user);
        await _context.SaveChangesAsync(cancellationToken);

        return NoContent();
    }
}

public record UpdateUserRoleRequest(string Role);

