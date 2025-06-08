// IdentityServerAPI/DTOs/Admin/AdminResetPasswordDto.cs
using System.ComponentModel.DataAnnotations;

namespace IdentityServerAPI.DTOs.Admin
{
    public class AdminResetPasswordDto
    {
        [Required(ErrorMessage = "Mật khẩu mới là bắt buộc.")]
        [StringLength(100, ErrorMessage = "{0} phải có ít nhất {2} và tối đa {1} ký tự.", MinimumLength = 6)]
        public string NewPassword { get; set; } = string.Empty;

        [DataType(DataType.Password)]
        [Compare("NewPassword", ErrorMessage = "Mật khẩu và xác nhận mật khẩu không khớp.")]
        public string ConfirmPassword { get; set; } = string.Empty;
    }
}