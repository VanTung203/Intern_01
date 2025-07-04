// IdentityServerAPI/Services/Interfaces/IAuthService.cs
//using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using IdentityServerAPI.DTOs; 
//using System.Threading.Tasks;
using System.Security.Claims;

namespace IdentityServerAPI.Services.Interfaces
{
    public interface IAuthService
    {
        Task<IActionResult> RegisterUserAsync(RegisterDto model, IUrlHelper url, string requestScheme);
        Task<IActionResult> ConfirmUserEmailAsync(string userId, string token, string frontendLoginUrl);
        Task<IActionResult> LoginUserAsync(LoginDto model);
        Task<IActionResult> VerifyTwoFactorTokenAsync(VerifyTwoFactorDto model);
        Task<IActionResult> ForgotPasswordAsync(ForgotPasswordDto model);
        Task<IActionResult> ResetUserPasswordAsync(ResetPasswordDto model);
        Task<IActionResult> ChangeUserPasswordAsync(ClaimsPrincipal userPrincipal, ChangePasswordDto model);
        Task<IActionResult> HandleGoogleLoginCallbackAsync();
    }
}