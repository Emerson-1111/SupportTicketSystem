using System.Text.Json;
using OpenAI.Chat;
using SupportTicketSystem.Application.Interfaces;
using Microsoft.Extensions.Configuration;

namespace SupportTicketSystem.Infrastructure.Services;

public class OpenAITicketAnalyzerService : IAIService
{
    private readonly ChatClient _chatClient;

    public OpenAITicketAnalyzerService(IConfiguration configuration)
    {
        // Lee la API Key desde el appsettings.json o variables de entorno (¡nunca la pongas en código duro!)
        string apiKey = configuration["OpenAI:ApiKey"]!;
        _chatClient = new ChatClient(model: "gpt-4o-mini", apiKey: apiKey);
    }

    public async Task<(string Category, string Priority)> AnalyzeTicketAsync(string description)
    {
        var prompt = $@"
        Eres un agente de soporte técnico de nivel 1. Analiza el siguiente problema del usuario:
        '{description}'

        Clasifícalo en una de estas categorías: 'Hardware', 'Software', 'Red', 'Cuenta'.
        Asigna una prioridad: 'Baja', 'Media', 'Alta'.

        Responde ÚNICAMENTE con un JSON válido con las propiedades 'categoria' y 'prioridad', sin texto extra ni markdown.
        Ejemplo: {{\""categoria\"": \""Red\"", \""prioridad\"": \""Alta\""}}
        ";

        // Llamamos a la IA
        var completion = await _chatClient.CompleteChatAsync(prompt);
        var jsonResponse = completion.Value.Content[0].Text;

        // Limpiamos el JSON por si la IA añadió markdown (```json ... ```)
        jsonResponse = jsonResponse.Replace("```json", "").Replace("```", "").Trim();

        try
        {
            // Extraemos los datos
            using var document = JsonDocument.Parse(jsonResponse);
            var category = document.RootElement.GetProperty("categoria").GetString() ?? "General";
            var priority = document.RootElement.GetProperty("prioridad").GetString() ?? "Media";

            return (category, priority);
        }
        catch
        {
            // Fallback de seguridad si la IA se equivoca
            return ("General", "Media");
        }
    }
}