namespace SupportTicketSystem.Application.Interfaces;

public interface IAIService
{
    Task<(string Category, string Priority)> AnalyzeTicketAsync(string description);
}