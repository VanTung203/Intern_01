// IdentityServerAPI/Controllers/AuthController.cs
using Microsoft.AspNetCore.Mvc;
using IdentityServerAPI.DTOs; // Hoặc IdentityServerAPI.DTOs.Auth
using IdentityServerAPI.Services.Interfaces; // Import IAuthService
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;

namespace IdentityServerAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService; // Sử dụng IAuthService
        private readonly IConfiguration _configuration; // Trường đã được khai báo
        
        public AuthController(IAuthService authService, IConfiguration configuration) // Inject IAuthService và IConfiguration
        {
            _authService = authService;
            _configuration = configuration; // Gán IConfiguration được inject vào trường _configuration
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
            // Lấy URL của trang "xác thực email thành công" trên frontend từ configuration
            var frontendConfirmedUrl = _configuration["FrontendEmailConfirmedUrl"];
            if (string.IsNullOrEmpty(frontendConfirmedUrl))
            {
                // Log lỗi hoặc sử dụng một URL mặc định an toàn
                frontendConfirmedUrl = "http://localhost:3000/login"; // Mặc định về login nếu không có config
                // Hoặc throw exception nếu đây là cấu hình bắt buộc
            }

            var result = await _authService.ConfirmUserEmailAsync(userId, token, frontendConfirmedUrl);

            if (result is OkObjectResult okResult && okResult.Value is { } value)
            {
                var redirectToProperty = value.GetType().GetProperty("redirectTo");
                if (redirectToProperty != null)
                {
                var redirectTo = redirectToProperty.GetValue(value) as string;
                    if (!string.IsNullOrEmpty(redirectTo))
                    {
                        return Redirect(redirectTo); // Backend sẽ redirect trình duyệt đến frontendConfirmedUrl
                    }
                }
            }
            return BadRequest("Xác minh email thất bại hoặc có lỗi xảy ra."); // Hoặc trả về một trang lỗi của frontend
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