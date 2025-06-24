using DividiFacil.API.Extensions;
using DividiFacil.API.Jobs;
using DividiFacil.API.Middleware;
using DividiFacil.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Serilog;
using System.Text;
using Microsoft.Extensions.Caching.Memory;

var builder = WebApplication.CreateBuilder(args);

// Configurar Serilog
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .CreateLogger();

builder.Host.UseSerilog();

// Agregar servicios al contenedor
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// Configurar Swagger usando m�todo de extensi�n
builder.Services.ConfigureSwagger();

// Configurar JsonOptions para manejar referencias circulares
builder.Services.ConfigureJsonOptions();


// Configurar DbContext
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Configurar AutoMapper
builder.Services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());

// Configurar JWT
string jwtKey = builder.Configuration["Jwt:Key"] ?? throw new InvalidOperationException("La clave JWT no est� configurada en appsettings.json");
var key = Encoding.ASCII.GetBytes(jwtKey);

builder.Services.AddAuthorization(options =>
{
    // Pol�ticas para roles dentro de los grupos
    options.AddPolicy("GrupoAdmin", policy =>
        policy.RequireClaim("role", "Admin"));

    options.AddPolicy("GrupoMember", policy =>
        policy.RequireClaim("role", "Member", "Admin"));

    // Pol�ticas para acciones espec�ficas
    options.AddPolicy("CanDeleteGasto", policy =>
        policy.RequireAssertion(context =>
            context.User.HasClaim("role", "Admin") ||
            context.User.HasClaim(c =>
                c.Type == "idMiembroPagador" &&
                c.Value == context.Resource.ToString())));

    options.AddPolicy("CanManageGroup", policy =>
        policy.RequireClaim("role", "Admin"));
});

builder.Services.AddAuthentication(x =>
{
    x.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    x.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(x =>
{
    x.RequireHttpsMetadata = false; // En producci�n, establecer a true
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

// Agregar IMemoryCache al contenedor de servicios
builder.Services.AddMemoryCache();

// Configurar optimizaci�n de Entity Framework
builder.Services.AddDbContext<ApplicationDbContext>(options => {
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"),
        sqlOptions => {
            sqlOptions.EnableRetryOnFailure(
                maxRetryCount: 5,
                maxRetryDelay: TimeSpan.FromSeconds(30),
                errorNumbersToAdd: null);
            sqlOptions.CommandTimeout(30);
        });

    // S�lo habilitar en desarrollo para ayudar con la depuraci�n
    if (builder.Environment.IsDevelopment())
    {
        options.EnableSensitiveDataLogging();
    }
});

// Registrar repositorios y servicios usando los m�todos de extensi�n actualizados
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

app.UseMiddleware<PaginationMiddleware>();

// A�adir esta l�nea al pipeline despu�s de app.UseAuthorization()
app.UseResponseCaching();

// Ruta para archivos est�ticos (como im�genes de comprobantes)
app.UseStaticFiles();

app.MapControllers();

app.Run();