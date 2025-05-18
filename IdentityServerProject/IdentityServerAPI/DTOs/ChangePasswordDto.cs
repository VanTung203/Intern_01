// IdentityServerAPI/DTOs/Auth/ChangePasswordDto.cs
using System.ComponentModel.DataAnnotations;

namespace IdentityServerAPI.DTOs
{
    public class ChangePasswordDto
    {
        [Required(ErrorMessage = "Mật khẩu hiện tại là bắt buộc")]
        public string CurrentPassword { get; set; } = string.Empty;

        [Required(ErrorMessage = "Mật khẩu mới là bắt buộc")]
        [StringLength(100, ErrorMessage = "{0} phải có ít nhất {2} và tối đa {1} ký tự.", MinimumLength = 6)]
        public string NewPassword { get; set; } = string.Empty;

        [DataType(DataType.Password)]
        [Compare("NewPassword", ErrorMessage = "Mật khẩu mới và mật khẩu xác nhận không khớp.")]
        public string ConfirmNewPassword { get; set; } = string.Empty;
    }
}