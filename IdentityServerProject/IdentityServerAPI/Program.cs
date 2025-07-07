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
// using IdentityServerAPI.Repositories;
using IdentityServerAPI.Services;
using IdentityServerAPI.Services.Interfaces;
using Microsoft.OpenApi.Models;
using Microsoft.Extensions.Logging;

var builder = WebApplication.CreateBuilder(args);

// --- 1. Đăng ký các lớp cấu hình (Settings) ---
builder.Services.Configure<MongoSettings>(builder.Configuration.GetSection("MongoSettings"));
builder.Services.Configure<EmailSettings>(builder.Configuration.GetSection("EmailSettings"));
builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("JwtSettings"));

// --- 2. Cấu hình và đăng ký MongoDB Client và Database ---
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

// // --- 3. Đăng ký UserStore và RoleStore ---
// builder.Services.AddScoped<IUserStore<ApplicationUser>, UserStore>();
// builder.Services.AddScoped<IRoleStore<ApplicationRole>, RoleStore>();

// --- 4. Cấu hình ASP.NET Core Identity ---
builder.Services.AddIdentity<ApplicationUser, ApplicationRole>(options =>
    {
        options.Password.RequireDigit = true;
        options.Password.RequireLowercase = true;
        options.Password.RequireUppercase = true;
        options.Password.RequireNonAlphanumeric = false;
        options.Password.RequiredLength = 6;
        options.SignIn.RequireConfirmedEmail = true;
        // options.User.RequireUniqueEmail = true;

        // >>> THAY ĐỔI QUAN TRỌNG: SỬ DỤNG EMAILTOKENPROVIDER CHO RESET MẬT KHẨU <<<
        // EmailTokenProvider sẽ tạo ra mã OTP 6 số.
        options.Tokens.PasswordResetTokenProvider = TokenOptions.DefaultEmailProvider; // "Email"
        // Mặc định, token từ EmailTokenProvider (là một dạng TOTP) có thời gian sống ngắn (khoảng 3 phút).
        // Điều này phù hợp với OTP.
    })
    .AddMongoDbStores<ApplicationUser, ApplicationRole, Guid>(
        builder.Configuration.GetValue<string>("MongoSettings:ConnectionString"),
        builder.Configuration.GetValue<string>("MongoSettings:DatabaseName") // Lấy tên DB từ cấu hình
    )
    .AddDefaultTokenProviders(); // Đảm bảo dòng này vẫn còn. Nó đăng ký EmailTokenProvider với tên "Email".

// --- 5. Đăng ký các Services ---
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IAuthService, AuthService>(); // AuthService là nơi logic chính
builder.Services.AddScoped<IUserService, UserService>();

// --- 6. Cấu hình JWT Authentication và thêm GOOGLE Authentication ---
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    var jwtSettings = builder.Configuration.GetSection("JwtSettings").Get<JwtSettings>();
    if (jwtSettings == null || string.IsNullOrEmpty(jwtSettings.SecretKey) || string.IsNullOrEmpty(jwtSettings.Issuer) || string.IsNullOrEmpty(jwtSettings.Audience))
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
})
.AddGoogle(googleOptions =>
{
    var googleAuthSettings = builder.Configuration.GetSection("GoogleAuthSettings");
    var clientId = googleAuthSettings["ClientId"];
    var clientSecret = googleAuthSettings["ClientSecret"];

    if (string.IsNullOrEmpty(clientId) || string.IsNullOrEmpty(clientSecret))
    {
        throw new InvalidOperationException("Google ClientId and ClientSecret are not configured in appsettings.json.");
    }

    googleOptions.ClientId = clientId;
    googleOptions.ClientSecret = clientSecret;
    // Tích hợp với hệ thống Identity có sẵn
    googleOptions.SignInScheme = IdentityConstants.ExternalScheme;
});

// --- Thêm các dịch vụ cần thiết khác ---
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "IdentityServerAPI", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement()
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                },
                Scheme = "oauth2",
                Name = "Bearer",
                In = ParameterLocation.Header,
            },
            new List<string>()
        }
    });
});

// Cấu hình CORS (Giữ nguyên)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontendOrigin",
        policyBuilder =>
        {
            var frontendUrl = builder.Configuration["FrontendUrl"] ?? "http://localhost:3000";
            policyBuilder.WithOrigins(frontendUrl)
                         .AllowAnyHeader()
                         .AllowAnyMethod();
        });
});

// Cấu hình Kestrel (Giữ nguyên)
builder.WebHost.ConfigureKestrel(options =>
{
    var httpPortEnv = Environment.GetEnvironmentVariable("ASPNETCORE_HTTP_PORTS");
    var httpsPortEnv = Environment.GetEnvironmentVariable("ASPNETCORE_HTTPS_PORTS");
    int httpPort = 5116;
    int httpsPort = 7289;

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
        listenOptions.UseHttps();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "IdentityServerAPI v1"));
    app.UseDeveloperExceptionPage();

    // GỌI HÀM SEED Ở ĐÂY
    using (var scope = app.Services.CreateScope()) // Tạo scope để lấy services
    {
        var services = scope.ServiceProvider;
        try
        {
            // Gọi hàm seed, truyền services provider để nó có thể resolve UserManager, RoleManager,...
            await SeedDatabaseAsync(services);
        }
        catch (Exception ex)
        {
            var logger = services.GetRequiredService<ILogger<Program>>();
            logger.LogError(ex, "An error occurred while seeding the DB.");
        }
    }

}
else
{
    app.UseHsts();
    app.UseHttpsRedirection();
}

app.UseStaticFiles();
app.UseRouting();
app.UseCors("AllowFrontendOrigin");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();

// ĐỊNH NGHĨA HÀM SEED DATABASE
async Task SeedDatabaseAsync(IServiceProvider services)
{
    // Không cần tạo scope nữa vì đã tạo ở nơi gọi
    var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();
    var roleManager = services.GetRequiredService<RoleManager<ApplicationRole>>();
    var configuration = services.GetRequiredService<IConfiguration>();
    var logger = services.GetRequiredService<ILogger<Program>>(); // Hoặc ILogger<T> nếu tạo class riêng cho Seeder

    logger.LogInformation("Attempting to seed database...");

    // 1. Seed Roles
    string adminRoleName = "Admin";
    string userRoleName = "User";

    if (!await roleManager.RoleExistsAsync(adminRoleName))
    {
        var adminRole = new ApplicationRole(adminRoleName); // Sử dụng constructor đã định nghĩa
        var result = await roleManager.CreateAsync(adminRole);
        if (result.Succeeded) logger.LogInformation($"Role '{adminRoleName}' created successfully.");
        else logger.LogError($"Error creating role '{adminRoleName}': {string.Join(", ", result.Errors.Select(e => e.Description))}");
    }
    else
    {
        logger.LogInformation($"Role '{adminRoleName}' already exists.");
    }

    if (!await roleManager.RoleExistsAsync(userRoleName))
    {
        var userRole = new ApplicationRole(userRoleName);
        var result = await roleManager.CreateAsync(userRole);
        if (result.Succeeded) logger.LogInformation($"Role '{userRoleName}' created successfully.");
        else logger.LogError($"Error creating role '{userRoleName}': {string.Join(", ", result.Errors.Select(e => e.Description))}");
    }
    else
    {
        logger.LogInformation($"Role '{userRoleName}' already exists.");
    }

    // 2. Seed Admin User
    var adminConfig = configuration.GetSection("SeedAdminUser");
    var adminEmail = adminConfig["Email"];
    var adminUserName = adminConfig["UserName"];
    var adminPassword = adminConfig["Password"];

    if (string.IsNullOrEmpty(adminEmail) || string.IsNullOrEmpty(adminPassword) || string.IsNullOrEmpty(adminUserName))
    {
        logger.LogError("Admin user seed configuration (Email, UserName, Password) is missing in appsettings.json. Skipping admin user seed.");
        return; // Thoát nếu thiếu cấu hình
    }

    var adminUserInDb = await userManager.FindByEmailAsync(adminEmail);
    if (adminUserInDb == null)
    {
        var newAdminUser = new ApplicationUser
        {
            UserName = adminUserName,
            Email = adminEmail,
            EmailConfirmed = true, // Admin đầu tiên nên được xác thực sẵn
            FirstName = adminConfig["FirstName"] ?? "Admin1", // Sử dụng giá trị từ config hoặc mặc định
            LastName = adminConfig["LastName"] ?? "Admin",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var result = await userManager.CreateAsync(newAdminUser, adminPassword);
        if (result.Succeeded)
        {
            logger.LogInformation($"Admin user '{adminEmail}' created successfully.");
            // Gán vai trò Admin
            if (await roleManager.RoleExistsAsync(adminRoleName))
            {
                var addToRoleResult = await userManager.AddToRoleAsync(newAdminUser, adminRoleName);
                if (addToRoleResult.Succeeded) logger.LogInformation($"User '{adminEmail}' added to role '{adminRoleName}'.");
                else logger.LogError($"Error adding user '{adminEmail}' to role '{adminRoleName}': {string.Join(", ", addToRoleResult.Errors.Select(e => e.Description))}");
            }
            else
            {
                 logger.LogWarning($"Role '{adminRoleName}' does not exist. Cannot assign to admin user.");
            }
        }
        else
        {
            logger.LogError($"Failed to create admin user '{adminEmail}': {string.Join(", ", result.Errors.Select(e => e.Description))}");
        }
    }
    else
    {
        logger.LogInformation($"Admin user '{adminEmail}' already exists.");
        // Đảm bảo admin user hiện tại có vai trò Admin, nếu chưa có thì gán lại
        if (!await userManager.IsInRoleAsync(adminUserInDb, adminRoleName) && await roleManager.RoleExistsAsync(adminRoleName))
        {
            logger.LogInformation($"Attempting to add role '{adminRoleName}' to existing admin user '{adminEmail}'.");
            var addToRoleResult = await userManager.AddToRoleAsync(adminUserInDb, adminRoleName);
             if (addToRoleResult.Succeeded) logger.LogInformation($"Existing user '{adminEmail}' successfully added to role '{adminRoleName}'.");
             else logger.LogError($"Error adding existing user '{adminEmail}' to role '{adminRoleName}': {string.Join(", ", addToRoleResult.Errors.Select(e => e.Description))}");
        }
    }
    logger.LogInformation("Database seeding finished.");
}