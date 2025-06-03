// IdentityServerAPI/DTOs/VerifyTwoFactorDto.cs
using System.ComponentModel.DataAnnotations;

namespace IdentityServerAPI.DTOs
{
    public class VerifyTwoFactorDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        [StringLength(6, MinimumLength = 6, ErrorMessage = "Mã OTP phải có 6 chữ số.")]
        [RegularExpression("^[0-9]{6}$", ErrorMessage = "Mã OTP chỉ được chứa chữ số.")]
        public string OtpCode { get; set; } = string.Empty;
    }
}