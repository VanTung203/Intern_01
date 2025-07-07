// IdentityServerAPI/Services/UserService.cs
using IdentityServerAPI.DTOs.User;
using IdentityServerAPI.DTOs.Admin;
using IdentityServerAPI.Models;
using IdentityServerAPI.Services.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
//using System;
//using System.Linq;
using System.Security.Claims;
//using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace IdentityServerAPI.Services
{
    public class UserService : IUserService
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ILogger<UserService> _logger;

        public UserService(UserManager<ApplicationUser> userManager, ILogger<UserService> logger)
        {
            _userManager = userManager;
            _logger = logger;
        }

        public async Task<IActionResult> GetUserProfileAsync(ClaimsPrincipal userPrincipal)
        {
            var user = await _userManager.GetUserAsync(userPrincipal);
            if (user == null)
            {
                // Trả về 404 Not Found nếu không tìm thấy người dùng
                return new NotFoundObjectResult(new { message = "Không tìm thấy người dùng." });
            }

            // Map từ ApplicationUser sang UserProfileDto
            var userProfileDto = new UserProfileDto
            {
                Id = user.Id.ToString(),
                Email = user.Email ?? string.Empty,
                FirstName = user.FirstName ?? string.Empty,
                LastName = user.LastName ?? string.Empty,
                AvatarUrl = user.AvatarUrl, // Thêm các trường mới
                PhoneNumber = user.PhoneNumber,
                Province = user.Province,
                District = user.District,
                Ward = user.Ward,
                StreetAddress = user.StreetAddress,
                TwoFactorEnabled = user.TwoFactorEnabled
            };
            return new OkObjectResult(userProfileDto); // Trả về 200 OK với dữ liệu profile
        }

        public async Task<IActionResult> UpdateUserProfileAsync(ClaimsPrincipal userPrincipal, UpdateUserProfileDto model)
        {
            var user = await _userManager.GetUserAsync(userPrincipal);
            if (user == null)
            {
                // Trả về 404 Not Found nếu không tìm thấy người dùng
                return new NotFoundObjectResult(new { message = "Không tìm thấy người dùng." });
            }

            // --- SỬA ĐỔI LOGIC CẬP NHẬT ---
            // Chỉ cập nhật các trường nếu giá trị từ model không phải là `null`.
            // Điều này cho phép người dùng gửi lên một chuỗi rỗng "" để xóa nội dung một trường.

            if (model.FirstName != null)
            {
                user.FirstName = model.FirstName;
            }
            if (model.LastName != null)
            {
                user.LastName = model.LastName;
            }
            if (model.PhoneNumber != null) 
            {
                user.PhoneNumber = model.PhoneNumber;
            }
            if (model.Province != null) 
            {
                user.Province = model.Province;
            }
            if (model.District != null) 
            {
                user.District = model.District;
            }
            if (model.Ward != null) 
            {
                user.Ward = model.Ward;
            }
            if (model.StreetAddress != null) 
            {
                user.StreetAddress = model.StreetAddress;
            }
            // Logic này để xử lý việc cập nhật avatarUrl từ handleSubmit của form
            if (model.AvatarUrl != null)
            {
                user.AvatarUrl = model.AvatarUrl;
            }

            user.UpdatedAt = DateTime.UtcNow;

            // Lưu các thay đổi vào database
            var result = await _userManager.UpdateAsync(user);

            if (!result.Succeeded)
            {
                // Trả về 400 Bad Request nếu có lỗi từ Identity (ví dụ: validation của Identity)
                var errors = result.Errors.Select(e => new { code = e.Code, description = e.Description });
                return new BadRequestObjectResult(new { title = "Cập nhật hồ sơ thất bại", errors = errors });
            }

            // Trả về 200 OK với thông báo thành công
            // Có thể trả về cả UserProfileDto đã được cập nhật nếu frontend cần
            return new OkObjectResult(new { message = "Hồ sơ đã được cập nhật thành công." });
        }

        public async Task<IActionResult> EnableTwoFactorAuthAsync(ClaimsPrincipal userPrincipal)
        {
            var user = await _userManager.GetUserAsync(userPrincipal);
            if (user == null)
            {
                return new NotFoundObjectResult(new { message = "Không tìm thấy người dùng." });
            }

            // Đảm bảo email đã được xác nhận trước khi bật 2FA qua email
            if (!user.EmailConfirmed)
            {
                return new BadRequestObjectResult(new { message = "Vui lòng xác nhận địa chỉ email của bạn trước khi bật xác thực 2 lớp." });
            }

            var result = await _userManager.SetTwoFactorEnabledAsync(user, true);
            if (!result.Succeeded)
            {
                _logger.LogError("Failed to enable 2FA for user {UserId}: {Errors}", user.Id, string.Join(", ", result.Errors.Select(e => e.Description)));
                return new BadRequestObjectResult(new { title = "Không thể bật xác thực 2 lớp.", errors = result.Errors.Select(e => new { e.Code, e.Description }) });
            }

            _logger.LogInformation("2FA enabled for user {UserId}", user.Id);
            // (Tùy chọn) Nếu muốn tạo và hiển thị mã khôi phục (recovery codes) ở đây cho người dùng
            // var recoveryCodes = await _userManager.GenerateNewTwoFactorRecoveryCodesAsync(user, 10);
            // return new OkObjectResult(new { message = "Xác thực 2 lớp đã được bật.", recoveryCodes = recoveryCodes });
            return new OkObjectResult(new { message = "Xác thực 2 lớp đã được bật." });
        }

        public async Task<IActionResult> DisableTwoFactorAuthAsync(ClaimsPrincipal userPrincipal)
        {
            var user = await _userManager.GetUserAsync(userPrincipal);
            if (user == null)
            {
                return new NotFoundObjectResult(new { message = "Không tìm thấy người dùng." });
            }

            var result = await _userManager.SetTwoFactorEnabledAsync(user, false);
            if (!result.Succeeded)
            {
                _logger.LogError("Failed to disable 2FA for user {UserId}: {Errors}", user.Id, string.Join(", ", result.Errors.Select(e => e.Description)));
                return new BadRequestObjectResult(new { title = "Không thể tắt xác thực 2 lớp.", errors = result.Errors.Select(e => new { e.Code, e.Description }) });
            }

            _logger.LogInformation("2FA disabled for user {UserId}", user.Id);
            return new OkObjectResult(new { message = "Xác thực 2 lớp đã được tắt." });
        }

        public async Task<IActionResult> GetAllUsersAsync(string? searchQuery, string? status)
        {
            var query = _userManager.Users.AsQueryable();

            // 1. Lọc theo từ khóa tìm kiếm
            if (!string.IsNullOrWhiteSpace(searchQuery))
            {
                var lowerCaseQuery = searchQuery.Trim().ToLower();
                query = query.Where(u =>
                    (u.Email != null && u.Email.ToLower().Contains(lowerCaseQuery)) ||
                    (u.PhoneNumber != null && u.PhoneNumber.Contains(lowerCaseQuery))
                );
            }

            // 2. Lọc theo trạng thái
            if (!string.IsNullOrEmpty(status) && status != "all")
            {
                switch (status.ToLower())
                {
                    case "active":
                        // Hoạt động: Đã xác thực và không bị khóa
                        query = query.Where(u => u.EmailConfirmed && (u.LockoutEnd == null || u.LockoutEnd <= DateTimeOffset.UtcNow));
                        break;
                    case "inactive":
                        // Chưa xác thực
                        query = query.Where(u => !u.EmailConfirmed);
                        break;
                    case "locked":
                        // Bị khóa
                        query = query.Where(u => u.LockoutEnd != null && u.LockoutEnd > DateTimeOffset.UtcNow);
                        break;
                }
            }

            var users = query.ToList();

            var userDtos = new List<UserProfileDto>();
            foreach (var user in users)
            {
                userDtos.Add(new UserProfileDto
                {
                    Id = user.Id.ToString(),
                    Email = user.Email,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    EmailConfirmed = user.EmailConfirmed,
                    PhoneNumber = user.PhoneNumber,
                    LockoutEnd = user.LockoutEnd,
                    TwoFactorEnabled = user.TwoFactorEnabled,
                    AvatarUrl = user.AvatarUrl,
                    Roles = await _userManager.GetRolesAsync(user),
                    Province = user.Province,
                    District = user.District,
                    Ward = user.Ward,
                    StreetAddress = user.StreetAddress
                });
            }

            return new OkObjectResult(userDtos);
        }

        public async Task<IActionResult> CreateUserAsync(CreateUserDto model)
        {
            // 1. Kiểm tra xem vai trò có hợp lệ không ("Admin" hoặc "User")
            if (model.Role != "Admin" && model.Role != "User")
            {
                return new BadRequestObjectResult(new { message = "Vai trò được chọn không hợp lệ." });
            }

            // 2. Kiểm tra xem email đã tồn tại chưa
            var userExists = await _userManager.FindByEmailAsync(model.Email);
            if (userExists != null)
            {
                return new ConflictObjectResult(new { message = "Địa chỉ email này đã được sử dụng." });
            }

            // 3. Tạo đối tượng ApplicationUser
            var user = new ApplicationUser
            {
                UserName = model.Email,
                Email = model.Email,
                FirstName = model.FirstName,
                LastName = model.LastName,
                EmailConfirmed = true, // Admin tạo thì mặc định xác thực luôn
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
            };

            // 4. Tạo người dùng với mật khẩu
            var result = await _userManager.CreateAsync(user, model.Password);

            if (!result.Succeeded)
            {
                // Trả về lỗi nếu không tạo được user (ví dụ: mật khẩu yếu)
                return new BadRequestObjectResult(new { title = "Không thể tạo người dùng.", errors = result.Errors });
            }

            // 5. Gán vai trò cho người dùng
            await _userManager.AddToRoleAsync(user, model.Role);

            _logger.LogInformation("Admin created a new account with email {Email} and role {Role}", user.Email, model.Role);

            // 6. (Tùy chọn) Trả về thông tin người dùng vừa tạo
            var createdUserDto = new UserProfileDto
            {
                Id = user.Id.ToString(),
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                EmailConfirmed = user.EmailConfirmed,
                Roles = new List<string> { model.Role }
            };

            return new OkObjectResult(new { message = "Tạo tài khoản thành công!", user = createdUserDto });
        }

        public async Task<IActionResult> ResetPasswordByAdminAsync(string targetUserId, AdminResetPasswordDto model)
        {
            var user = await _userManager.FindByIdAsync(targetUserId);
            if (user == null)
            {
                return new NotFoundObjectResult(new { message = "Không tìm thấy người dùng." });
            }

            // Tạo một token reset mật khẩu.
            // Đây là cách làm an toàn và được khuyến khích nhất bởi ASP.NET Core Identity.
            var token = await _userManager.GeneratePasswordResetTokenAsync(user);

            // Sử dụng token đó ngay lập tức để đặt lại mật khẩu.
            var result = await _userManager.ResetPasswordAsync(user, token, model.NewPassword);

            if (!result.Succeeded)
            {
                return new BadRequestObjectResult(new { title = "Không thể đặt lại mật khẩu.", errors = result.Errors });
            }

            _logger.LogInformation("Password for user {UserId} was reset by an admin.", user.Id);
            return new OkObjectResult(new { message = "Đặt lại mật khẩu cho người dùng thành công." });
        }

        public async Task<IActionResult> LockUserAsync(string targetUserId)
        {
            var user = await _userManager.FindByIdAsync(targetUserId);
            if (user == null)
            {
                return new NotFoundObjectResult(new { message = "Không tìm thấy người dùng." });
            }

            // Đặt ngày hết hạn khóa là một ngày rất xa trong tương lai để khóa "vĩnh viễn"
            var result = await _userManager.SetLockoutEndDateAsync(user, DateTimeOffset.MaxValue);

            if (!result.Succeeded)
            {
                return new BadRequestObjectResult(new { title = "Không thể khóa tài khoản.", errors = result.Errors });
            }

            _logger.LogInformation("User {UserId} was locked out by an admin.", user.Id);
            return new OkObjectResult(new { message = "Tài khoản đã được khóa thành công." });
        }

        public async Task<IActionResult> UnlockUserAsync(string targetUserId)
        {
            var user = await _userManager.FindByIdAsync(targetUserId);
            if (user == null)
            {
                return new NotFoundObjectResult(new { message = "Không tìm thấy người dùng." });
            }

            // Đặt ngày hết hạn khóa về null hoặc một thời điểm trong quá khứ để mở khóa
            var result = await _userManager.SetLockoutEndDateAsync(user, null);

            if (!result.Succeeded)
            {
                return new BadRequestObjectResult(new { title = "Không thể mở khóa tài khoản.", errors = result.Errors });
            }

            _logger.LogInformation("User {UserId} was unlocked by an admin.", user.Id);
            return new OkObjectResult(new { message = "Tài khoản đã được mở khóa thành công." });
        }

        public async Task<IActionResult> DeleteUserAsync(string targetUserId)
        {
            var user = await _userManager.FindByIdAsync(targetUserId);
            if (user == null)
            {
                return new NotFoundObjectResult(new { message = "Không tìm thấy người dùng." });
            }

            // TODO: Cân nhắc thêm logic kiểm tra không cho phép Admin tự xóa chính mình ở đây
            // Ví dụ: if (adminPrincipal.GetUserId() == targetUserId) return BadRequest(...)

            var result = await _userManager.DeleteAsync(user);

            if (!result.Succeeded)
            {
                return new BadRequestObjectResult(new { title = "Không thể xóa tài khoản.", errors = result.Errors });
            }

            _logger.LogInformation("User {UserId} was deleted by an admin.", user.Id);
            return new OkObjectResult(new { message = "Tài khoản đã được xóa thành công." });
        }
    }
}