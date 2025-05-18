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
using IdentityServerAPI.Repositories; // Quan trọng: Namespace cho CustomUserStore, CustomRoleStore
using IdentityServerAPI.Services;
using IdentityServerAPI.Services.Interfaces;
using Microsoft.OpenApi.Models; // Cho OpenApiInfo và các lớp liên quan đến Swagger

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

// --- 3. Đăng ký UserStore và RoleStore với namespace mới ---
// Giả sử bạn đã đổi tên class thành CustomUserStore và CustomRoleStore
// và chúng nằm trong namespace IdentityServerAPI.Repositories
builder.Services.AddScoped<IUserStore<ApplicationUser>, UserStore>();
builder.Services.AddScoped<IRoleStore<ApplicationRole>, RoleStore>();

// --- 4. Cấu hình ASP.NET Core Identity ---
builder.Services.AddIdentity<ApplicationUser, ApplicationRole>(options =>
    {
        options.Password.RequireDigit = true;
        options.Password.RequireLowercase = true;
        options.Password.RequireUppercase = true;
        options.Password.RequireNonAlphanumeric = false;
        options.Password.RequiredLength = 6;
        options.SignIn.RequireConfirmedEmail = true;
        // options.User.RequireUniqueEmail = true; // Cân nhắc bật tùy chọn này
    })
    .AddDefaultTokenProviders();

// --- 5. Đăng ký các Services ---
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IUserService, UserService>();

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
});

// --- Thêm các dịch vụ cần thiết khác ---
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "IdentityServerAPI", Version = "v1" }); // Sử dụng OpenApiInfo đầy đủ
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme // Sử dụng OpenApiSecurityScheme đầy đủ
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header, // Sử dụng ParameterLocation đầy đủ
        Type = SecuritySchemeType.ApiKey, // Sử dụng SecuritySchemeType đầy đủ
        Scheme = "Bearer"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement()
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference // Sử dụng OpenApiReference đầy đủ
                {
                    Type = ReferenceType.SecurityScheme, // Sử dụng ReferenceType đầy đủ
                    Id = "Bearer"
                },
                Scheme = "oauth2", // scheme có thể là "oauth2" hoặc giữ "Bearer"
                Name = "Bearer",
                In = ParameterLocation.Header,
            },
            new List<string>()
        }
    });
});

// Cấu hình CORS
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

// Cấu hình Kestrel
builder.WebHost.ConfigureKestrel(options =>
{
    var httpPortEnv = Environment.GetEnvironmentVariable("ASPNETCORE_HTTP_PORTS");
    var httpsPortEnv = Environment.GetEnvironmentVariable("ASPNETCORE_HTTPS_PORTS");
    int httpPort = 5116;
    int httpsPort = 7289; // Port HTTPS từ launchSettings mặc định của bạn

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

// --- Configure the HTTP request pipeline. ---
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "IdentityServerAPI v1"));
    app.UseDeveloperExceptionPage();
    // KHÔNG gọi UseHttpsRedirection ở đây nếu frontend dev chạy HTTP và gặp lỗi CORS
}
else
{
    // app.UseExceptionHandler("/Error"); // Cân nhắc thêm trang lỗi chung cho production
    app.UseHsts();
    app.UseHttpsRedirection(); // BẮT BUỘC cho môi trường không phải Development
}

// Dòng app.UseHttpsRedirection(); ở đây không còn cần thiết nếu đã xử lý trong if/else
// app.UseHttpsRedirection();

// >>> THÊM DÒNG NÀY ĐỂ PHỤC VỤ FILE TĨNH TỪ THƯ MỤC WWWROOT (BAO GỒM AVATARS) <<<
app.UseStaticFiles();
// >>> KẾT THÚC PHẦN THÊM <<<

app.UseRouting();

app.UseCors("AllowFrontendOrigin"); // Áp dụng CORS policy

app.UseAuthentication(); // Đảm bảo UseAuthentication được gọi trước UseAuthorization
app.UseAuthorization();

app.MapControllers();

app.Run();