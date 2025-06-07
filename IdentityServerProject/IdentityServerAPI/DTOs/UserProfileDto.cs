// IdentityServerAPI/DTOs/User/UserProfileDto.cs
namespace IdentityServerAPI.DTOs.User
{
    public class UserProfileDto
    {
        public string Id { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string? AvatarUrl { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Province { get; set; }
        public string? District { get; set; }
        public string? Ward { get; set; }
        public string? StreetAddress { get; set; }
        public bool TwoFactorEnabled { get; set; }

        // --- THÊM CÁC TRƯỜNG SAU CHO ADMIN VIEW ---
        public IList<string>? Roles { get; set; } // Thêm danh sách vai trò
        public bool EmailConfirmed { get; set; } // Thêm trạng thái xác thực email
        public DateTimeOffset? LockoutEnd { get; set; } // Thêm thông tin khóa tài khoản
    }
}