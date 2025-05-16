// Program.cs
using System.Net;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using IdentityServerAPI.Models;
using IdentityServerAPI.Configuration;
using IdentityServerAPI.Repositories; // Namespace cho CustomUserStore, CustomRoleStore
using IdentityServerAPI.Services;     // Namespace cho EmailService, AuthService
using IdentityServerAPI.Services.Interfaces; // Namespace cho IAuthService, IEmailService

var builder = WebApplication.CreateBuilder(args);

// --- 1. Đăng ký các lớp cấu hình (Settings) ---
builder.Services.Configure<MongoSettings>(builder.Configuration.GetSection("MongoSettings"));
builder.Services.Configure<EmailSettings>(builder.Configuration.GetSection("EmailSettings"));
builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("JwtSettings"));

// --- 2. Cấu hình và đăng ký MongoDB Client và Database ---
// Bỏ khối code lặp lại (khối thứ hai trong code gốc)
builder.Services.AddSingleton<IMongoClient>(sp =>
{
    var settings = sp.GetRequiredService<IOptions<MongoSettings>>().Value;
    if (string.IsNullOrEmpty(settings.ConnectionString))
    {
        throw new InvalidOperationException("MongoDB ConnectionString is not configured in MongoSettings.");
    }
    return new MongoClient(settings.ConnectionString);
});

builder.Services.AddSingleton<IMongoDatabase>(sp =>
{
    var settings = sp.GetRequiredService<IOptions<MongoSettings>>().Value;
    var client = sp.GetRequiredService<IMongoClient>();
    if (string.IsNullOrEmpty(settings.DatabaseName))
    {
        throw new InvalidOperationException("MongoDB DatabaseName is not configured in MongoSettings.");
    }
    return client.GetDatabase(settings.DatabaseName);
});

// --- 3. Đăng ký UserStore và RoleStore với namespace mới ---
// và namespace là IdentityServerAPI.Repositories
builder.Services.AddScoped<IUserStore<ApplicationUser>, UserStore>(); 
builder.Services.AddScoped<IRoleStore<ApplicationRole>, RoleStore>(); 

// --- 4. Cấu hình ASP.NET Core Identity ---
builder.Services.AddIdentity<ApplicationUser, ApplicationRole>(options =>
    {
        options.Password.RequireDigit = true;
        options.Password.RequireLowercase = true;
        options.Password.RequireUppercase = true;
        options.Password.RequireNonAlphanumeric = false; // Ví dụ: không yêu cầu ký tự đặc biệt
        options.Password.RequiredLength = 6;

        options.SignIn.RequireConfirmedEmail = true; // Yêu cầu xác thực email

        // Cấu hình Lockout (tùy chọn)
        // options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(5);
        // options.Lockout.MaxFailedAccessAttempts = 5;
        // options.Lockout.AllowedForNewUsers = true;

        // Cấu hình User (tùy chọn)
        // options.User.RequireUniqueEmail = true;
    })
    .AddDefaultTokenProviders();

// --- 5. Đăng ký các Services ---
builder.Services.AddScoped<IEmailService, EmailService>(); // Đăng ký với Interface
builder.Services.AddScoped<IAuthService, AuthService>();   // Đăng ký AuthService với Interface

// --- 6. Cấu hình JWT Authentication ---
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    var jwtSettings = builder.Configuration.GetSection("JwtSettings").Get<JwtSettings>();

    if (jwtSettings == null ||
        string.IsNullOrEmpty(jwtSettings.SecretKey) ||
        string.IsNullOrEmpty(jwtSettings.Issuer) ||
        string.IsNullOrEmpty(jwtSettings.Audience))
    {
        throw new InvalidOperationException("JWT settings (SecretKey, Issuer, Audience) are not properly configured.");
    }

    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings.Issuer,
        ValidAudience = jwtSettings.Audience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.SecretKey))
    };
});

// --- Thêm các dịch vụ cần thiết khác ---
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo { Title = "IdentityServerAPI", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Bearer {token}\"",
        Name = "Authorization",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement()
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                },
            },
            new List<string>()
        }
    });
});

// Cấu hình CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontendOrigin", // Đặt tên policy rõ ràng hơn
        policyBuilder =>
        {
            // Lấy URL frontend từ appsettings.json để linh hoạt hơn
            var frontendUrl = builder.Configuration["FrontendUrl"] ?? "http://localhost:3000"; // Giá trị mặc định nếu không có trong config
            policyBuilder.WithOrigins(frontendUrl)
                         .AllowAnyHeader()
                         .AllowAnyMethod();
        });
});

// Cấu hình Kestrel
builder.WebHost.ConfigureKestrel(options =>
{
    var httpPortEnv = Environment.GetEnvironmentVariable("ASPNETCORE_HTTP_PORTS");
    var httpsPortEnv = Environment.GetEnvironmentVariable("ASPNETCORE_HTTPS_PORTS");

    int httpPort = 5116; // Giá trị mặc định
    int httpsPort = 7289; // Giá trị mặc định (từ launchSettings)

    if (!string.IsNullOrEmpty(httpPortEnv) && int.TryParse(httpPortEnv, out int parsedHttpPort))
    {
        httpPort = parsedHttpPort;
    }
     if (!string.IsNullOrEmpty(httpsPortEnv) && int.TryParse(httpsPortEnv, out int parsedHttpsPort))
    {
        httpsPort = parsedHttpsPort;
    }

    options.Listen(IPAddress.Any, httpPort);
    options.Listen(IPAddress.Any, httpsPort, listenOptions =>
    {
        listenOptions.UseHttps(); // Cấu hình chứng chỉ HTTPS nếu cần cho môi trường khác development
    });
});

var app = builder.Build();

// --- Configure the HTTP request pipeline. ---
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "IdentityServerAPI v1"));
    app.UseDeveloperExceptionPage();
}
else
{
    // Thêm global error handler cho production
    // app.UseExceptionHandler("/Error");
    // app.UseHsts(); // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
}

app.UseHttpsRedirection();

app.UseRouting(); // Quan trọng: UseRouting trước UseCors và UseAuthentication/UseAuthorization

app.UseCors("AllowFrontendOrigin"); // Áp dụng CORS policy

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();