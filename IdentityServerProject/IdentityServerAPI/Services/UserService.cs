// IdentityServerAPI/Services/UserService.cs
using IdentityServerAPI.DTOs.User;
using IdentityServerAPI.Models;
using IdentityServerAPI.Services.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc; // Cần cho IActionResult và các ObjectResults
using System; // Cho DateTime
using System.Linq; // Cho Select
using System.Security.Claims;
using System.Threading.Tasks;

namespace IdentityServerAPI.Services
{
    public class UserService : IUserService
    {
        private readonly UserManager<ApplicationUser> _userManager;

        public UserService(UserManager<ApplicationUser> userManager)
        {
            _userManager = userManager;
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

            // Cập nhật các thuộc tính của user từ model DTO
            user.FirstName = model.FirstName;
            user.LastName = model.LastName;
            user.PhoneNumber = model.PhoneNumber; // Cập nhật các trường mới
            user.Province = model.Province;
            user.District = model.District;
            user.Ward = model.Ward;
            user.StreetAddress = model.StreetAddress;
            user.UpdatedAt = DateTime.UtcNow; // Cập nhật thời gian sửa đổi

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
    }
}