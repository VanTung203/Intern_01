// IdentityServerAPI/Models/ApplicationUser.cs
using Microsoft.AspNetCore.Identity;
using System;

namespace IdentityServerAPI.Models
{
    public class ApplicationUser : IdentityUser<Guid> // Giữ nguyên Id kiểu Guid nếu bạn đã dùng
    {
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        // Bỏ FullName nếu bạn đã quyết định ghép từ FirstName và LastName khi cần
        // public string FullName { get; set; } = string.Empty;

        // THÊM CÁC TRƯỜNG MỚI
        public string? AvatarUrl { get; set; } // Đường dẫn tới ảnh avatar đã lưu
        // public string? PhoneNumber { get; set; } // Số điện thoại (nullable)
        public string? Province { get; set; }    // Tỉnh/Thành phố (nullable)
        public string? District { get; set; }    // Quận/Huyện (nullable)
        public string? Ward { get; set; }        // Phường/Xã (nullable)
        public string? StreetAddress { get; set; } // Địa chỉ cụ thể (số nhà, tên đường) (nullable)

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow; // Thêm trường này để theo dõi cập nhật
    }
}