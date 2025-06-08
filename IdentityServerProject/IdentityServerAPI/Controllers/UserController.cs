// IdentityServerAPI/Controllers/UserController.cs
using IdentityServerAPI.DTOs.User;
using IdentityServerAPI.DTOs.Admin;
using IdentityServerAPI.Models;
using IdentityServerAPI.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
//using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
//using Microsoft.Extensions.Hosting;
//using System; // Cho Path, Guid
//using System.IO;
//using System.Linq;
//using System.Threading.Tasks;

namespace IdentityServerAPI.Controllers
{
    [Authorize] // Tất cả các action trong controller này yêu cầu xác thực bằng JWT token
    [Route("api/[controller]")] // Sẽ tạo ra route /api/User (nếu tên class là UserController)
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly UserManager<ApplicationUser> _userManager; // Cần để cập nhật trực tiếp ApplicationUser
        private readonly IWebHostEnvironment _webHostEnvironment; // Để lấy đường dẫn wwwroot và lưu file

        public UserController(
            IUserService userService,
            UserManager<ApplicationUser> userManager,
            IWebHostEnvironment webHostEnvironment) // Inject các dependency
        {
            _userService = userService;
            _userManager = userManager;
            _webHostEnvironment = webHostEnvironment;
        }

        [HttpGet("me")] // Route: GET /api/user/me
        public async Task<IActionResult> GetMyProfile()
        {
            // User (ClaimsPrincipal) được tự động gán từ token JWT đã được xác thực
            return await _userService.GetUserProfileAsync(User);
        }

        [HttpPut("me/profile")] // Route: PUT /api/user/me/profile
        public async Task<IActionResult> UpdateMyProfile([FromBody] UpdateUserProfileDto model)
        {
            if (!ModelState.IsValid) // Kiểm tra validation từ DTO attributes
            {
                return BadRequest(ModelState);
            }
            return await _userService.UpdateUserProfileAsync(User, model);
        }

        [HttpPost("me/avatar")] // Route: POST /api/user/me/avatar
        public async Task<IActionResult> UploadAvatar(IFormFile file) // Nhận file từ request
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(new { message = "Không có file nào được chọn để tải lên." });
            }

            // Kiểm tra kích thước file (ví dụ: 200KB = 200 * 1024 bytes)
            // Có thể đặt giá trị này vào appsettings.json
            long maxFileSize = 200 * 1024;
            if (file.Length > maxFileSize)
            {
                return BadRequest(new { message = $"Kích thước file vượt quá giới hạn cho phép ({maxFileSize / 1024}KB)." });
            }

            // Kiểm tra định dạng file
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif" };
            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (string.IsNullOrEmpty(extension) || !allowedExtensions.Contains(extension))
            {
                return BadRequest(new { message = "Định dạng file không hợp lệ. Chỉ chấp nhận các định dạng: " + string.Join(", ", allowedExtensions) });
            }

            // Lấy thông tin người dùng hiện tại
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
            {
                return NotFound(new { message = "Không tìm thấy người dùng." }); // Hoặc Unauthorized nếu token không hợp lệ
            }

            try
            {
                // Tạo đường dẫn và tên file duy nhất
                var uploadsFolderPath = Path.Combine(_webHostEnvironment.WebRootPath ?? string.Empty, "avatars"); // Thư mục lưu avatars
                if (string.IsNullOrEmpty(_webHostEnvironment.WebRootPath))
                {
                    // Log lỗi: WebRootPath is not configured.
                    return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Lỗi cấu hình server: không tìm thấy thư mục gốc web." });
                }

                if (!Directory.Exists(uploadsFolderPath))
                {
                    Directory.CreateDirectory(uploadsFolderPath); // Tạo thư mục nếu chưa có
                }

                // Xóa avatar cũ (nếu có và không phải là avatar mặc định)
                if (!string.IsNullOrEmpty(user.AvatarUrl) && !user.AvatarUrl.EndsWith("default-avatar.png")) // Giả sử có default-avatar.png
                {
                    var oldAvatarPath = Path.Combine(_webHostEnvironment.WebRootPath, user.AvatarUrl.TrimStart('/'));
                    if (System.IO.File.Exists(oldAvatarPath))
                    {
                        try
                        {
                            System.IO.File.Delete(oldAvatarPath);
                        }
                        catch (IOException ex)
                        {
                            // Log lỗi xóa file cũ, nhưng vẫn tiếp tục upload file mới
                            // _logger.LogError(ex, $"Could not delete old avatar: {oldAvatarPath}");
                        }
                    }
                }

                // Tạo tên file mới để tránh trùng lặp và các vấn đề bảo mật với tên file gốc
                var uniqueFileName = $"{Guid.NewGuid().ToString()}{extension}";
                var filePath = Path.Combine(uploadsFolderPath, uniqueFileName);

                // Lưu file mới
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                // Cập nhật đường dẫn avatar cho người dùng
                // Đường dẫn lưu trong database nên là đường dẫn tương đối có thể truy cập từ web
                user.AvatarUrl = $"/avatars/{uniqueFileName}";
                user.UpdatedAt = DateTime.UtcNow; // Cập nhật thời gian

                var updateResult = await _userManager.UpdateAsync(user);

                if (!updateResult.Succeeded)
                {
                    // Nếu cập nhật user thất bại, xóa file vừa tải lên
                    if (System.IO.File.Exists(filePath))
                    {
                        System.IO.File.Delete(filePath);
                    }
                    var errors = updateResult.Errors.Select(e => new { code = e.Code, description = e.Description });
                    return BadRequest(new { title = "Lỗi khi cập nhật thông tin người dùng với avatar mới.", errors = errors });
                }

                return Ok(new { message = "Avatar đã được tải lên và cập nhật thành công.", avatarUrl = user.AvatarUrl });
            }
            catch (Exception ex)
            {
                // Log lỗi chi tiết ở đây
                // _logger.LogError(ex, "Error occurred while uploading avatar.");
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Đã có lỗi xảy ra trên máy chủ khi tải lên avatar." });
            }
        }

        [HttpPost("me/security/enable-2fa")] // POST /api/user/me/security/enable-2fa
        public async Task<IActionResult> EnableMyTwoFactorAuth()
        {
            return await _userService.EnableTwoFactorAuthAsync(User);
        }

        [HttpPost("me/security/disable-2fa")] // POST /api/user/me/security/disable-2fa
        public async Task<IActionResult> DisableMyTwoFactorAuth()
        {
            return await _userService.DisableTwoFactorAuthAsync(User);
        }

        [HttpGet("all")] // Route: GET /api/user/all
        [Authorize(Roles = "Admin")] // <-- RẤT QUAN TRỌNG: Chỉ người dùng có vai trò "Admin" mới được truy cập
        public async Task<IActionResult> GetAllUsers([FromQuery] string? searchQuery, [FromQuery] string? status)
        {
            return await _userService.GetAllUsersAsync(searchQuery, status);
        }
        
        [HttpPost("create")] // Route: POST /api/user/create
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateUser([FromBody] CreateUserDto model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            return await _userService.CreateUserAsync(model);
        }
    }
}