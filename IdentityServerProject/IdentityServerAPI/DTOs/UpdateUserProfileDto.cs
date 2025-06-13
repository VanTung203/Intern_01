using System.ComponentModel.DataAnnotations;

namespace IdentityServerAPI.DTOs.User
{
    public class UpdateUserProfileDto
    {
        // [Required(ErrorMessage = "Họ là bắt buộc")]
        [StringLength(50)]
        public string? LastName { get; set; } = string.Empty;

        // [Required(ErrorMessage = "Tên là bắt buộc")]
        [StringLength(50)]
        public string? FirstName { get; set; } = string.Empty;

        // Thay thế [Phone] bằng [RegularExpression]
        // Regex này cho phép chuỗi rỗng HOẶC một chuỗi có từ 10-15 chữ số.
        [RegularExpression(@"^(\d{10,15})?$", ErrorMessage = "Số điện thoại phải là chuỗi số từ 10-15 ký tự.")]
        [StringLength(15)]
        public string? PhoneNumber { get; set; }

        [StringLength(100)]
        public string? Province { get; set; }

        [StringLength(100)]
        public string? District { get; set; }

        [StringLength(100)]
        public string? Ward { get; set; }

        [StringLength(250)]
        public string? StreetAddress { get; set; }

        public string? AvatarUrl { get; set; }
    }
}