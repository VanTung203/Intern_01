// IdentityServerAPI/Configuration/JwtSettings.cs
namespace IdentityServerAPI.Configuration
{
    public class JwtSettings
    {
        public string SecretKey { get; set; } = string.Empty;
        public string Issuer { get; set; } = string.Empty;
        public string Audience { get; set; } = string.Empty;
        public int ExpiresInMinutes { get; set; } = 60; // Thêm nếu cần
    }
}