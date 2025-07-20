using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using PetWhenua.Services;
using PetWhenua.Services.Abstract;
using PetWhenua.Repositories.Abstract;
using PetWhenua.Repositories.Concrete;
using PetWhenua.Services.Factories;
using PetWhenua.Models.Configuration;
using PetWhenua.Utils;
using PetWhenua.Models;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.MaxDepth = 3; // Reduce depth to prevent cycles
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
        
        // Configure DateTime serialization to always include timezone information
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
        options.JsonSerializerOptions.Converters.Add(new PetWhenua.Utils.UtcDateTimeConverter());
        options.JsonSerializerOptions.Converters.Add(new PetWhenua.Utils.UtcNullableDateTimeConverter());
        
        // Configure DateTime to serialize as UTC with 'Z' suffix
        options.JsonSerializerOptions.DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull;
    });
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "PetWhenua API",
        Version = "v1",
        Description = "API for PetWhenua social platform"
    });
    
    // Add JWT authentication to Swagger
    c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
        Name = "Authorization",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    
    c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });

    // Handle IFormFile types properly
    c.MapType<IFormFile>(() => new Microsoft.OpenApi.Models.OpenApiSchema
    {
        Type = "string",
        Format = "binary"
    });

    c.MapType<IFormFileCollection>(() => new Microsoft.OpenApi.Models.OpenApiSchema
    {
        Type = "array",
        Items = new Microsoft.OpenApi.Models.OpenApiSchema
        {
            Type = "string",
            Format = "binary"
        }
    });

    // Add support for enums as strings
    c.UseInlineDefinitionsForEnums();
    
    // Configure to handle circular references better
    c.SchemaGeneratorOptions.SchemaIdSelector = type => type.FullName?.Replace("+", ".");
    
    // Ignore obsolete members to prevent issues
    c.IgnoreObsoleteActions();
    c.IgnoreObsoleteProperties();
    
    // Use one-of for polymorphic types
    c.UseOneOfForPolymorphism();
    c.SelectSubTypesUsing(baseType => new Type[] { });
});

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        var allowedOrigins = new List<string>
        {
            "http://localhost:5173", 
            "https://localhost:5173"
        };

        // Add Azure frontend URL if configured
        var azureFrontendUrl = builder.Configuration["AzureFrontendUrl"];
        if (!string.IsNullOrEmpty(azureFrontendUrl))
        {
            allowedOrigins.Add(azureFrontendUrl);
        }

        policy.WithOrigins(allowedOrigins.ToArray())
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials()
              .SetIsOriginAllowed(_ => true); // Required for SignalR
    });
});

// Add Entity Framework Core services
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

// Fallback to Azure SQL if no connection string found
if (string.IsNullOrEmpty(connectionString) || connectionString.Contains("localdb"))
{
    connectionString = "Server=tcp:tongymsa.database.windows.net,1433;Initial Catalog=PetWhenuaDb;Persist Security Info=False;User ID=cloudadmin;Password=punYgiT2809;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;";
}

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(connectionString, 
        sqlOptions =>
        {
            sqlOptions.EnableRetryOnFailure(
                maxRetryCount: 5,
                maxRetryDelay: TimeSpan.FromSeconds(30),
                errorNumbersToAdd: null);
            sqlOptions.CommandTimeout(120);
        }));

// Register repositories
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IPetRepository, PetRepository>();
builder.Services.AddScoped<IPostRepository, PostRepository>();

// Register factories
builder.Services.AddScoped<IUserFactory, UserFactory>();
builder.Services.AddScoped<IPetFactory, PetFactory>();
builder.Services.AddScoped<IPostFactory, PostFactory>();

// Register services
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IPetService, PetService>();
builder.Services.AddScoped<IPostService, PostService>();
builder.Services.AddScoped<IPetConnectionService, PetConnectionService>();
builder.Services.AddScoped<IPetWeddingService, PetWeddingService>();
builder.Services.AddScoped<IUserFollowService, UserFollowService>();
builder.Services.AddScoped<IImageService, ImageService>();
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddScoped<IChatService, ChatService>();

// Configure Image Upload Settings
builder.Services.Configure<ImageUploadSettings>(
    builder.Configuration.GetSection("ImageUpload"));

builder.Services.AddScoped<IPostAuthorizationService, PostAuthorizationService>();
builder.Services.AddScoped<PostExpiryService>();
builder.Services.AddHostedService<PostExpiryBackgroundService>();

// Configure JWT Authentication
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["SecretKey"] ?? "YourDefaultSecretKeyHere123456789";
var issuer = jwtSettings["Issuer"] ?? "PetWhenuaApp";
var audience = jwtSettings["Audience"] ?? "PetWhenuaUsers";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = issuer,
        ValidAudience = audience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(secretKey)),
        ClockSkew = TimeSpan.Zero
    };
    
    // Configure JWT for SignalR
    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            var accessToken = context.Request.Query["access_token"];
            var path = context.HttpContext.Request.Path;
            if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs"))
            {
                context.Token = accessToken;
            }
            return Task.CompletedTask;
        }
    };
});

builder.Services.AddAuthorization();

// Add SignalR
builder.Services.AddSignalR(options =>
{
    options.EnableDetailedErrors = true;
    options.KeepAliveInterval = TimeSpan.FromSeconds(30);        // Send keepalive every 30 seconds
    options.ClientTimeoutInterval = TimeSpan.FromSeconds(60);   // Timeout client after 60 seconds
    options.HandshakeTimeout = TimeSpan.FromSeconds(30);        // Allow 30 seconds for handshake
    options.MaximumReceiveMessageSize = 1024 * 1024;            // 1MB max message size
    options.StreamBufferCapacity = 10;                          // Buffer for streaming
});

builder.Configuration.AddJsonFile("appsettings.json", optional: true, reloadOnChange: true);

var app = builder.Build();

// Automatically apply migrations in production - TEMPORARILY DISABLED FOR DEBUGGING
// if (app.Environment.IsProduction())
// {
//     using (var scope = app.Services.CreateScope())
//     {
//         try
//         {
//             var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
//             context.Database.Migrate();
//         }
//         catch (Exception ex)
//         {
//             // Log the error but don't prevent app startup
//             var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
//             logger.LogError(ex, "An error occurred while migrating the database.");
//         }
//     }
// }

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
else
{
    // Enable Swagger in production for API testing
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "PetWhenua API V1");
        c.RoutePrefix = "swagger";
        c.DocumentTitle = "PetWhenua API Documentation";
    });
}

app.UseHttpsRedirection();

// Serve static files (for uploaded images)
app.UseStaticFiles();

// Use CORS
app.UseCors("AllowReactApp");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Map SignalR Hub
app.MapHub<PetWhenua.Hubs.NotificationHub>("/hubs/notifications");

app.Run();
