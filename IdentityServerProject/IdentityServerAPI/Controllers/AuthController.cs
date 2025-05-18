// IdentityServerAPI/Controllers/AuthController.cs
using Microsoft.AspNetCore.Mvc;
using IdentityServerAPI.DTOs;
using IdentityServerAPI.Services.Interfaces;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration; // Đã có
using Microsoft.AspNetCore.Authorization; // Đã có

namespace IdentityServerAPI.Controllers
{
    [Route("api/[controller]")] // Route cơ sở là /api/Auth
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly IConfiguration _configuration; // Giữ lại IConfiguration nếu AuthService không tự xử lý hết việc đọc config

        public AuthController(IAuthService authService, IConfiguration configuration)
        {
            _authService = authService;
            _configuration = configuration; // Giữ lại nếu ConfirmEmail vẫn cần đọc config trực tiếp ở đây
        }

        [HttpPost("register")] // POST /api/Auth/register
        public async Task<IActionResult> Register([FromBody] RegisterDto model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            // Url và Request.Scheme được truyền để AuthService có thể tạo callback URL đúng
            return await _authService.RegisterUserAsync(model, Url, Request.Scheme);
        }

        [HttpGet("confirmemail")] // GET /api/Auth/confirmemail?userId=...&token=...
        public async Task<IActionResult> ConfirmEmail(string userId, string token)
        {
            // Lấy URL của trang "xác thực email thành công" trên frontend từ configuration
            // AuthService đã xử lý việc này, nhưng nếu bạn muốn AuthController quyết định URL cuối cùng
            // thì có thể giữ logic đọc config ở đây và truyền vào service.
            // Tuy nhiên, để Controller mỏng hơn, AuthService nên tự lấy config này nếu cần.
            // Giả sử AuthService đã được cập nhật để tự lấy FrontendEmailConfirmedUrl từ IConfiguration.
            // Nếu không, bạn cần truyền nó vào như cũ:
            string? frontendConfirmedUrl = _configuration["FrontendEmailConfirmedUrl"];
            if (string.IsNullOrEmpty(frontendConfirmedUrl))
            {
                // _logger.LogWarning("FrontendEmailConfirmedUrl is not configured..."); // Nếu có logger
                frontendConfirmedUrl = "http://localhost:3000/login"; // Default fallback
            }

            var result = await _authService.ConfirmUserEmailAsync(userId, token, frontendConfirmedUrl);

            // Xử lý kết quả từ service để thực hiện redirect
            if (result is OkObjectResult okResult && okResult.Value != null)
            {
                // Thử lấy thuộc tính 'redirectTo' từ đối tượng trả về
                var valueType = okResult.Value.GetType();
                var redirectToProperty = valueType.GetProperty("redirectTo");

                if (redirectToProperty != null && redirectToProperty.GetValue(okResult.Value) is string redirectTo && !string.IsNullOrEmpty(redirectTo))
                {
                    return Redirect(redirectTo); // Redirect phía server đến URL của frontend
                }
            }
            // Nếu không có redirectTo hoặc service trả về lỗi, trả về kết quả của service
            return result;
        }

        [HttpPost("login")] // POST /api/Auth/login
        public async Task<IActionResult> Login([FromBody] LoginDto model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            return await _authService.LoginUserAsync(model);
        }

        [HttpPost("forgot-password")] // POST /api/Auth/forgot-password
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            return await _authService.ForgotPasswordAsync(model);
        }

        [HttpPost("reset-password")] // POST /api/Auth/reset-password
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            return await _authService.ResetUserPasswordAsync(model);
        }

        // --- THÊM ENDPOINT MỚI CHO ĐỔI MẬT KHẨU ---
        [Authorize] // Yêu cầu người dùng phải đăng nhập (có JWT token hợp lệ)
        [HttpPost("change-password")] // POST /api/Auth/change-password
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            // User (ClaimsPrincipal) được tự động gán vào ControllerBase.User từ JWT token
            // sau khi middleware UseAuthentication xử lý.
            return await _authService.ChangeUserPasswordAsync(User, model);
        }
        // ---------------------------------------------
    }
}