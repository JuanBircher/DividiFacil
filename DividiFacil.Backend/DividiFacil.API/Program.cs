using DividiFacil.API.Extensions;
using DividiFacil.API.Jobs;
using DividiFacil.API.Middleware;
using DividiFacil.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Serilog;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Configurar Serilog
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .CreateLogger();

builder.Host.UseSerilog();

// Agregar servicios al contenedor
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// Configurar Swagger usando método de extensión
builder.Services.ConfigureSwagger();

// Configurar JsonOptions para manejar referencias circulares
builder.Services.ConfigureJsonOptions();

// Configurar DbContext
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Configurar AutoMapper
builder.Services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());

// Configurar JWT
string jwtKey = builder.Configuration["Jwt:Key"] ?? throw new InvalidOperationException("La clave JWT no está configurada en appsettings.json");
var key = Encoding.ASCII.GetBytes(jwtKey);

builder.Services.AddAuthentication(x =>
{
    x.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    x.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(x =>
{
    x.RequireHttpsMetadata = false; // En producción, establecer a true
    x.SaveToken = true;
    x.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = false,
        ValidateAudience = false,
        ClockSkew = TimeSpan.Zero
    };
});

// Configurar CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", builder =>
        builder.AllowAnyOrigin()
               .AllowAnyMethod()
               .AllowAnyHeader());
});

// Registrar repositorios y servicios usando los métodos de extensión actualizados
builder.Services.RegisterRepositories()
                .RegisterServices();

var app = builder.Build();

// Configure HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Middleware personalizado para capturar excepciones
app.UseMiddleware<ExceptionMiddleware>();

// Configurar CORS
app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();

// Ruta para archivos estáticos (como imágenes de comprobantes)
app.UseStaticFiles();

app.MapControllers();

app.Run();