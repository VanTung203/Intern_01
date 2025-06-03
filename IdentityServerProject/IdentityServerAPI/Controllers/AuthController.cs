// IdentityServerAPI/Controllers/AuthController.cs
using Microsoft.AspNetCore.Mvc;
using IdentityServerAPI.DTOs; // Đảm bảo using này có để nhận diện VerifyTwoFactorDto
using IdentityServerAPI.Services.Interfaces;
using System.Threading.Tasks; // Đảm bảo using này có
using Microsoft.Extensions.Configuration; // Đảm bảo using này có
using Microsoft.AspNetCore.Authorization;

namespace IdentityServerAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly IConfiguration _configuration;

        public AuthController(IAuthService authService, IConfiguration configuration)
        {
            _authService = authService;
            _configuration = configuration;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            return await _authService.RegisterUserAsync(model, Url, Request.Scheme);
        }

        [HttpGet("confirmemail")]
        public async Task<IActionResult> ConfirmEmail(string userId, string token)
        {
            string? frontendConfirmedUrl = _configuration["FrontendEmailConfirmedUrl"];
            if (string.IsNullOrEmpty(frontendConfirmedUrl))
            {
                // Cân nhắc log cảnh báo ở đây nếu dùng ILogger
                frontendConfirmedUrl = _configuration["FrontendUrls:Base"] ?? "http://localhost:3000/login"; // Sử dụng Base URL làm fallback hoặc một URL cụ thể
            }
            // Nếu muốn redirect đến trang /email-confirmed thay vì /login:
            // frontendConfirmedUrl = _configuration["FrontendUrls:EmailConfirmedRedirect"] ?? "http://localhost:3000/email-confirmed";


            var result = await _authService.ConfirmUserEmailAsync(userId, token, frontendConfirmedUrl);

            if (result is OkObjectResult okResult && okResult.Value != null)
            {
                var valueType = okResult.Value.GetType();
                var redirectToProperty = valueType.GetProperty("redirectTo");

                if (redirectToProperty != null && redirectToProperty.GetValue(okResult.Value) is string redirectTo && !string.IsNullOrEmpty(redirectTo))
                {
                    return Redirect(redirectTo);
                }
            }
            return result;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            // AuthService.LoginUserAsync sẽ trả về yêu cầu 2FA hoặc JWT token
            return await _authService.LoginUserAsync(model);
        }

        // >>> THÊM ENDPOINT MỚI ĐỂ XÁC THỰC OTP 2FA <<<
        [HttpPost("verify-2fa")] // Route: POST /api/auth/verify-2fa
        public async Task<IActionResult> VerifyTwoFactor([FromBody] VerifyTwoFactorDto model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            return await _authService.VerifyTwoFactorTokenAsync(model);
        }
        // >>> KẾT THÚC PHẦN THÊM <<<

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            return await _authService.ForgotPasswordAsync(model);
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            return await _authService.ResetUserPasswordAsync(model);
        }

        [Authorize]
        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            return await _authService.ChangeUserPasswordAsync(User, model);
        }
    }
}