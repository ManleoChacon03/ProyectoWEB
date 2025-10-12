using LibreriaChacon.Server.Contexts;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;
// --- A�ADIDO: USINGS PARA AUTENTICACI�N ---
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using QuestPDF.Infrastructure; // <-- A�ADE ESTE USING
using OfficeOpenXml;          // <-- A�ADE ESTE USING
// ------------------------------------------

var builder = WebApplication.CreateBuilder(args);

// --- A�ADIDO: CONFIGURACI�N DE LICENCIAS ---
QuestPDF.Settings.License = LicenseType.Community;
ExcelPackage.LicenseContext = LicenseContext.NonCommercial;
// -------------------

// Add services to the container.

builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
});

// Lee la cadena de conexi�n y configura el DbContext para usar SQL Server.
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// --- A�ADIDO: CONFIGURACI�N DE AUTENTICACI�N JWT ---
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true, // Valida qui�n emiti� el token
            ValidateAudience = true, // Valida para qui�n es el token
            ValidateLifetime = true, // Valida que el token no haya expirado
            ValidateIssuerSigningKey = true, // Valida la firma del token
            ValidIssuer = builder.Configuration["Jwt:Issuer"], // El emisor v�lido (de appsettings.json)
            ValidAudience = builder.Configuration["Jwt:Audience"], // La audiencia v�lida (de appsettings.json)
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"])) // La clave secreta (de appsettings.json)
        };
    });
// ----------------------------------------------------

var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();

// Configure the HTTP request pipeline.

app.UseHttpsRedirection();

// --- A�ADIDO: MIDDLEWARE DE AUTENTICACI�N ---
// Es muy importante que vaya ANTES de app.UseAuthorization()
app.UseAuthentication();
// ------------------------------------------

app.UseAuthorization();

app.MapControllers();

app.MapFallbackToFile("/index.html");

app.Run();