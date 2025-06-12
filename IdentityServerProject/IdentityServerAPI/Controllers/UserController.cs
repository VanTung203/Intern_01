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

        [HttpPost("me/avatar")]
        public async Task<IActionResult> UploadAvatar(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(new { message = "Không có file nào được chọn để tải lên." });
            }

            long maxFileSize = 200 * 1024;
            if (file.Length > maxFileSize)
            {
                return BadRequest(new { message = $"Kích thước file vượt quá giới hạn cho phép ({maxFileSize / 1024}KB)." });
            }

            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif" };
            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (string.IsNullOrEmpty(extension) || !allowedExtensions.Contains(extension))
            {
                return BadRequest(new { message = "Định dạng file không hợp lệ. Chỉ chấp nhận: " + string.Join(", ", allowedExtensions) });
            }

            var user = await _userManager.GetUserAsync(User);
            if (user == null)
            {
                return NotFound(new { message = "Không tìm thấy người dùng." });
            }

            try
            {
                // --- FIX 1: XÂY DỰNG ĐƯỜNG DẪN TỪ CONTENTROOTPATH ---
                // Sử dụng ContentRootPath (luôn tồn tại) thay vì WebRootPath (có thể null)
                // Điều này làm cho code hoạt động ngay cả khi thư mục wwwroot chưa được tạo.
                var wwwRootPath = Path.Combine(_webHostEnvironment.ContentRootPath, "wwwroot");
                var avatarsFolderPath = Path.Combine(wwwRootPath, "avatars");

                // Tạo thư mục 'wwwroot/avatars' nếu nó chưa tồn tại.
                // Directory.CreateDirectory sẽ tạo cả thư mục cha nếu cần.
                if (!Directory.Exists(avatarsFolderPath))
                {
                    Directory.CreateDirectory(avatarsFolderPath);
                }

                // Xóa avatar cũ nếu có
                if (!string.IsNullOrEmpty(user.AvatarUrl))
                {
                    // user.AvatarUrl có dạng "/avatars/filename.jpg"
                    var oldAvatarFileName = Path.GetFileName(user.AvatarUrl);
                    var oldAvatarFullPath = Path.Combine(avatarsFolderPath, oldAvatarFileName);
                    if (System.IO.File.Exists(oldAvatarFullPath))
                    {
                        try
                        {
                            System.IO.File.Delete(oldAvatarFullPath);
                        }
                        catch (IOException)
                        {
                            // Ghi log lỗi xóa file cũ, nhưng vẫn tiếp tục upload file mới
                        }
                    }
                }

                var uniqueFileName = $"{Guid.NewGuid()}{extension}";
                var newAvatarFullPath = Path.Combine(avatarsFolderPath, uniqueFileName);

                using (var stream = new FileStream(newAvatarFullPath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                // Đường dẫn lưu trong DB là đường dẫn tương đối để web có thể truy cập
                var relativePath = $"/avatars/{uniqueFileName}";
                user.AvatarUrl = relativePath;
                user.UpdatedAt = DateTime.UtcNow;

                var updateResult = await _userManager.UpdateAsync(user);

                if (!updateResult.Succeeded)
                {
                    if (System.IO.File.Exists(newAvatarFullPath))
                    {
                        System.IO.File.Delete(newAvatarFullPath);
                    }
                    var errors = updateResult.Errors.Select(e => new { code = e.Code, description = e.Description });
                    return BadRequest(new { title = "Lỗi khi cập nhật avatar.", errors });
                }

                // --- FIX 2: TRẢ VỀ 'filePath' ĐỂ KHỚP VỚI FRONTEND ---
                return Ok(new { message = "Avatar đã được cập nhật thành công.", filePath = user.AvatarUrl });
            }
            catch (Exception ex)
            {
                // Ghi log lỗi chi tiết ở đây, ví dụ: _logger.LogError(ex, "Lỗi upload avatar");
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

        [HttpPost("{userId}/admin-reset-password")] // Route: POST /api/user/{userId}/admin-reset-password
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ResetPasswordByAdmin(string userId, [FromBody] AdminResetPasswordDto model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            return await _userService.ResetPasswordByAdminAsync(userId, model);
        }

        [HttpPost("{userId}/lock")] // Route: POST /api/user/{userId}/lock
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> LockUser(string userId)
        {
            return await _userService.LockUserAsync(userId);
        }

        [HttpPost("{userId}/unlock")] // Route: POST /api/user/{userId}/unlock
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UnlockUser(string userId)
        {
            return await _userService.UnlockUserAsync(userId);
        }
        
        [HttpDelete("{userId}")] // Route: DELETE /api/user/{userId}
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteUser(string userId)
        {
            // TODO: Cân nhắc thêm logic kiểm tra không cho phép Admin tự xóa chính mình ở đây
            return await _userService.DeleteUserAsync(userId);
        }
    }
}