# Etapa de compilación
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copiar solución y restaurar dependencias
COPY ["SupportTicketSystem.API/SupportTicketSystem.API.csproj", "SupportTicketSystem.API/"]
COPY ["SupportTicketSystem.Application/SupportTicketSystem.Application.csproj", "SupportTicketSystem.Application/"]
COPY ["SupportTicketSystem.Domain/SupportTicketSystem.Domain.csproj", "SupportTicketSystem.Domain/"]
COPY ["SupportTicketSystem.Infrastructure/SupportTicketSystem.Infrastructure.csproj", "SupportTicketSystem.Infrastructure/"]
RUN dotnet restore "SupportTicketSystem.API/SupportTicketSystem.API.csproj"

# Copiar todo el código y compilar
COPY . .
WORKDIR "/src/SupportTicketSystem.API"
RUN dotnet publish -c Release -o /app/publish

# Etapa de ejecución
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "SupportTicketSystem.API.dll"]