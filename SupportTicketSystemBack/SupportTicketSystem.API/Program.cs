using Microsoft.EntityFrameworkCore;
using SupportTicketSystem.Application.Interfaces;
using SupportTicketSystem.Infrastructure.Persistence;
using SupportTicketSystem.Infrastructure.Services;
using MediatR;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// --- CONFIGURAR LA BASE DE DATOS ---
// Le decimos a EF Core que use PostgreSQL y lea la cadena de conexión del appsettings.json
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Le decimos a la aplicación: "Cada vez que alguien pida un IApplicationDbContext, dale el ApplicationDbContext real"
builder.Services.AddScoped<IApplicationDbContext>(provider =>
    provider.GetRequiredService<ApplicationDbContext>());


// --- CONFIGURAR MEDIATR ---
// Escanea la capa Application para encontrar todos nuestros Commands y Queries automáticamente
builder.Services.AddMediatR(cfg =>
    cfg.RegisterServicesFromAssembly(typeof(SupportTicketSystem.Application.Interfaces.IApplicationDbContext).Assembly));


// --- CONFIGURAR CORS ---
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:5173") // El puerto por defecto de Vite
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// --- CONFIGURAR CONTROLADORES Y SWAGGER ---
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(); // Para probar la API visualmente

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
        };
    });
builder.Services.AddAuthorization();

// Le decimos a la app que cuando alguien pida IAIService, le dé el de OpenAI
//builder.Services.AddScoped<IAIService, SupportTicketSystem.Infrastructure.Services.OpenAITicketAnalyzerService>();

builder.Services.AddScoped<IAIService, SupportTicketSystem.Infrastructure.Services.MockTicketAnalyzerService>();

var app = builder.Build();

// Configuración del Pipeline HTTP
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

//app.UseHttpsRedirection();
app.UseCors("AllowReactApp");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    context.Database.Migrate();

    // Crear usuario Administrador por defecto si no existe
    if (!context.Users.Any(u => u.Email == "admin@test.com"))
    {
        context.Users.Add(new SupportTicketSystem.Domain.Entities.User
        {
            Id = Guid.NewGuid(),
            Name = "Administrador del Sistema",
            Email = "admin@test.com",
            Password = BCrypt.Net.BCrypt.HashPassword("admin123"),
            Role = "Admin"
        });
    }

    // Crear usuario Estándar de prueba por defecto si no existe
    if (!context.Users.Any(u => u.Email == "usuario@test.com"))
    {
        context.Users.Add(new SupportTicketSystem.Domain.Entities.User
        {
            Id = Guid.NewGuid(),
            Name = "Usuario de Prueba",
            Email = "usuario@test.com",
            Password = BCrypt.Net.BCrypt.HashPassword("user123"),
            Role = "User"
        });
    }

    context.SaveChanges();
}

app.Run();