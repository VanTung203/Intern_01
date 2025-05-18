namespace IdentityServerAPI.DTOs.User
{
    public class UserProfileDto
    {
        public string Id { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty; // Email thường không cho sửa
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string? AvatarUrl { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Province { get; set; }
        public string? District { get; set; }
        public string? Ward { get; set; }
        public string? StreetAddress { get; set; }
        public bool TwoFactorEnabled { get; set; }
    }
}