// IdentityServerAPI/Controllers/AuthController.cs
using Microsoft.AspNetCore.Mvc;
using IdentityServerAPI.DTOs; // Hoặc IdentityServerAPI.DTOs.Auth
using IdentityServerAPI.Services.Interfaces; // Import IAuthService
using System.Threading.Tasks;

namespace IdentityServerAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService; // Sử dụng IAuthService

        public AuthController(IAuthService authService) // Inject IAuthService
        {
            _authService = authService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto model)
        {
            if (!ModelState.IsValid) // Model validation cơ bản bằng attributes trên DTO
            {
                return BadRequest(ModelState);
            }
            // Truyền Url helper và Request.Scheme để AuthService có thể tạo link
            return await _authService.RegisterUserAsync(model, Url, Request.Scheme);
        }

        [HttpGet("confirmemail")]
        public async Task<IActionResult> ConfirmEmail(string userId, string token)
        {
            // URL của trang login trên frontend sau khi xác thực email thành công
            // Nên lấy từ configuration thay vì hardcode
            var frontendLoginUrl = "https://yourfrontend.com/login"; // THAY THẾ BẰNG URL THỰC TẾ HOẶC CONFIG
            var result = await _authService.ConfirmUserEmailAsync(userId, token, frontendLoginUrl);

            // Xử lý kết quả từ service. Nếu service trả về OkObjectResult chứa redirectUrl,
            // controller có thể quyết định redirect hoặc trả về JSON cho client tự xử lý.
            if (result is OkObjectResult okResult && okResult.Value is { } value)
            {
                var redirectToProperty = value.GetType().GetProperty("redirectTo");
                if (redirectToProperty != null)
                {
                    var redirectTo = redirectToProperty.GetValue(value) as string;
                    if (!string.IsNullOrEmpty(redirectTo))
                    {
                        return Redirect(redirectTo); // Redirect phía server
                    }
                }
            }
            return result; // Trả về kết quả trực tiếp từ service
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            return await _authService.LoginUserAsync(model);
        }

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
    }
}