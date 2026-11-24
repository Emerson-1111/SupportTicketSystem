using SupportTicketSystem.Application.Interfaces;

namespace SupportTicketSystem.Infrastructure.Services;

public class MockTicketAnalyzerService : IAIService
{
    public Task<(string Category, string Priority)> AnalyzeTicketAsync(string description)
    {
        // Simulamos un retraso de 1 segundo para que parezca una llamada a una API real
        Task.Delay(1000).Wait();

        // Lógica súper básica simulando la IA
        var lowerDesc = description.ToLower();

        if (lowerDesc.Contains("pantalla") || lowerDesc.Contains("monitor") || lowerDesc.Contains("teclado"))
            return Task.FromResult(("Hardware", "Alta"));

        if (lowerDesc.Contains("internet") || lowerDesc.Contains("wifi") || lowerDesc.Contains("red"))
            return Task.FromResult(("Red", "Media"));

        return Task.FromResult(("Software", "Baja"));
    }
}