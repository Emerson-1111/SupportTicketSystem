using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using SupportTicketSystem.Application.Features.Tickets.Commands;
using SupportTicketSystem.Application.Features.Tickets.Queries;
using SupportTicketSystem.Application.Features.Comments.Commands;
using SupportTicketSystem.Application.Features.Comments.Queries;

namespace SupportTicketSystem.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TicketsController : ControllerBase
{
    private readonly IMediator _mediator;

    public TicketsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    [Authorize]
    public async Task<IActionResult> GetTickets()
    {
        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
        Guid? userId = Guid.TryParse(userIdStr, out var parsedId) ? parsedId : null;

        var tickets = await _mediator.Send(new GetTicketsQuery(userId, userRole));
        return Ok(tickets);
    }

    [HttpPost]
    public async Task<IActionResult> CreateTicket([FromBody] CreateTicketCommand command)
    {
        // MediatR busca quién maneja este comando y lo ejecuta
        var ticketId = await _mediator.Send(command);

        // Devuelve un HTTP 201 Created con el ID del nuevo ticket
        return CreatedAtAction(nameof(CreateTicket), new { id = ticketId }, ticketId);
    }

    [HttpGet("{id}/comments")]
    public async Task<IActionResult> GetComments(Guid id)
    {
        var comments = await _mediator.Send(new GetCommentsByTicketIdQuery(id));
        return Ok(comments);
    }

    [HttpPost("{id}/comments")]
    public async Task<IActionResult> AddComment(Guid id, [FromBody] AddCommentCommand command)
    {
        // Validación de seguridad básica
        if (id != command.TicketId) return BadRequest("El ID del ticket no coincide.");

        var commentId = await _mediator.Send(command);
        return Ok(commentId);
    }

    [HttpPut("{id}/status")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateTicketStatusCommand command)
    {
        if (id != command.TicketId)
            return BadRequest("El ID de la ruta no coincide con el del comando.");

        var success = await _mediator.Send(command);

        if (!success)
            return NotFound("Ticket no encontrado.");

        return NoContent(); // 204 No Content es el estándar para un PUT exitoso sin datos de retorno
    }

    [HttpGet("paginated")]
    [Authorize]
    public async Task<IActionResult> GetPaginated([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
        Guid? userId = Guid.TryParse(userIdStr, out var parsedId) ? parsedId : null;

        var result = await _mediator.Send(new GetPaginatedTicketsQuery(page, pageSize, userId, userRole));
        return Ok(result);
    }
}