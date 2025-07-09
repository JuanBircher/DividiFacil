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
using FluentValidation.AspNetCore;
using FluentValidation;
using DividiFacil.Data.Repositories.Interfaces;
using DividiFacil.Data.Repositories.Decorators;
using DividiFacil.Data.Repositories.Implementations;
using Microsoft.AspNetCore.RateLimiting;
using System.Threading.RateLimiting;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;
using OpenTelemetry.Metrics;
using OpenTelemetry.Instrumentation.SqlClient;
using Microsoft.AspNetCore.ResponseCompression;


var builder = WebApplication.CreateBuilder(args);

// Configurar telemetr�a
builder.Services.AddOpenTelemetry()
    .WithTracing(tracing =>
    {
        tracing
            .SetResourceBuilder(ResourceBuilder.CreateDefault().AddService(builder.Environment.ApplicationName))
            .AddAspNetCoreInstrumentation()    // Registra cada request HTTP
            .AddSqlClientInstrumentation()     // Registra cada consulta a SQL Server
            .AddConsoleExporter();             // Muestra la telemetr�a en consola
    })
    .WithMetrics(metrics =>
    {
        metrics
            .SetResourceBuilder(ResourceBuilder.CreateDefault().AddService(builder.Environment.ApplicationName))
            .AddAspNetCoreInstrumentation()
            .AddConsoleExporter();
    });

// Configurar Serilog
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .CreateLogger();

builder.Host.UseSerilog();

// Agregar servicios al contenedor
builder.Services.AddControllers();

builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddFluentValidationClientsideAdapters();
builder.Services.AddValidatorsFromAssemblyContaining<GastoCreacionDtoValidator>();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddApplicationServices();


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
                c.Value == (context.Resource != null ? context.Resource.ToString() : string.Empty))));

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

builder.Services.AddControllers(options =>
{
    options.Filters.Add<ModelValidationFilter>();
});

builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssemblyContaining<GastoCreacionDtoValidator>();

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

// Registrar el servicio de compresión Brotli y Gzip
builder.Services.AddResponseCompression(options =>
{
    options.EnableForHttps = true;
    options.Providers.Add<BrotliCompressionProvider>();
    options.Providers.Add<GzipCompressionProvider>();
    options.MimeTypes = ResponseCompressionDefaults.MimeTypes.Concat(new[]
    {
        "application/javascript",
        "text/css",
        "application/json",
        "image/svg+xml"
    });
});

// Configuración opcional de nivel de compresión
builder.Services.Configure<BrotliCompressionProviderOptions>(options =>
{
    options.Level = System.IO.Compression.CompressionLevel.Fastest;
});
builder.Services.Configure<GzipCompressionProviderOptions>(options =>
{
    options.Level = System.IO.Compression.CompressionLevel.Fastest;
});

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

builder.Services.AddScoped<UsuarioRepository>();


builder.Services.AddScoped<IUsuarioRepository>(sp =>
    new CachedUsuarioRepository(
        sp.GetRequiredService<UsuarioRepository>(),
        sp.GetRequiredService<IMemoryCache>()));

builder.Services.AddScoped<GrupoRepository>();


builder.Services.AddScoped<IGrupoRepository>(sp =>
    new CachedGrupoRepository(
        sp.GetRequiredService<GrupoRepository>(),
        sp.GetRequiredService<IMemoryCache>()));

builder.Services.AddScoped<ConfiguracionNotificacionesRepository>();


builder.Services.AddScoped<IConfiguracionNotificacionesRepository>(sp =>
    new CachedConfiguracionNotificacionesRepository(
        sp.GetRequiredService<ConfiguracionNotificacionesRepository>(),
        sp.GetRequiredService<IMemoryCache>()));

builder.Services.AddRateLimiter(options =>
{
    options.AddFixedWindowLimiter("GlobalLimiter", config =>
    {
        config.PermitLimit = 10; // M�ximo 10 requests
        config.Window = TimeSpan.FromSeconds(1); // Por segundo
        config.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
        config.QueueLimit = 0; // Sin cola, rechaza con 429
    });
    options.RejectionStatusCode = 429;
});

builder.Services.AddHealthChecks();

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

// Habilitar compresión de respuestas
app.UseResponseCompression();

app.UseMiddleware<PaginationMiddleware>();

// Añadir esta línea al pipeline después de app.UseAuthorization()
app.UseResponseCaching();

// Ruta para archivos estáticos (como imágenes de comprobantes)
app.UseDefaultFiles();
app.UseStaticFiles();

app.Use(async (context, next) =>
{
    if (!context.Request.Path.Value.StartsWith("/api") &&
        !System.IO.Path.HasExtension(context.Request.Path.Value))
    {
        context.Request.Path = "/index.html";
        await next();
    }
    else
    {
        await next();
    }
});

app.MapControllers();

app.MapHealthChecks("/health");

app.Run();