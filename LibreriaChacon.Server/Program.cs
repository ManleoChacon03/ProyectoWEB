using LibreriaChacon.Server.Contexts;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;
// --- AÑADIDO: USINGS PARA AUTENTICACIÓN ---
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using QuestPDF.Infrastructure; // <-- AÑADE ESTE USING
using OfficeOpenXml;          // <-- AÑADE ESTE USING
// ------------------------------------------

var builder = WebApplication.CreateBuilder(args);

// --- AÑADIDO: CONFIGURACIÓN DE LICENCIAS ---
QuestPDF.Settings.License = LicenseType.Community;
ExcelPackage.LicenseContext = LicenseContext.NonCommercial;
// -------------------

// Add services to the container.

builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
});

// Lee la cadena de conexión y configura el DbContext para usar SQL Server.
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// --- AÑADIDO: CONFIGURACIÓN DE AUTENTICACIÓN JWT ---
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true, // Valida quién emitió el token
            ValidateAudience = true, // Valida para quién es el token
            ValidateLifetime = true, // Valida que el token no haya expirado
            ValidateIssuerSigningKey = true, // Valida la firma del token
            ValidIssuer = builder.Configuration["Jwt:Issuer"], // El emisor válido (de appsettings.json)
            ValidAudience = builder.Configuration["Jwt:Audience"], // La audiencia válida (de appsettings.json)
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"])) // La clave secreta (de appsettings.json)
        };
    });
// ----------------------------------------------------

var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();

// Configure the HTTP request pipeline.

app.UseHttpsRedirection();

// --- AÑADIDO: MIDDLEWARE DE AUTENTICACIÓN ---
// Es muy importante que vaya ANTES de app.UseAuthorization()
app.UseAuthentication();
// ------------------------------------------

app.UseAuthorization();

app.MapControllers();

app.MapFallbackToFile("/index.html");

app.Run();