// IdentityServerAPI/Services/Interfaces/IAuthService.cs (Ví dụ)
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc; // Cần cho IActionResult hoặc các kiểu trả về tương tự
using IdentityServerAPI.DTOs; 
using System.Threading.Tasks;
using System.Security.Claims; // << THÊM DÒNG NÀY

namespace IdentityServerAPI.Services.Interfaces
{
    public interface IAuthService
    {
        Task<IActionResult> RegisterUserAsync(RegisterDto model, IUrlHelper url, string requestScheme);
        Task<IActionResult> ConfirmUserEmailAsync(string userId, string token, string frontendLoginUrl);
        Task<IActionResult> LoginUserAsync(LoginDto model);
        Task<IActionResult> ForgotPasswordAsync(ForgotPasswordDto model);
        Task<IActionResult> ResetUserPasswordAsync(ResetPasswordDto model);
        Task<IActionResult> ChangeUserPasswordAsync(ClaimsPrincipal userPrincipal, ChangePasswordDto model);
    }
}