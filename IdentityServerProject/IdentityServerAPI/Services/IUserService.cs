// IdentityServerAPI/Services/Interfaces/IUserService.cs
using IdentityServerAPI.DTOs.User;
using IdentityServerAPI.DTOs.Admin;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace IdentityServerAPI.Services.Interfaces
{
    public interface IUserService
    {
        Task<IActionResult> GetUserProfileAsync(ClaimsPrincipal userPrincipal);
        Task<IActionResult> UpdateUserProfileAsync(ClaimsPrincipal userPrincipal, UpdateUserProfileDto model);
        Task<IActionResult> EnableTwoFactorAuthAsync(ClaimsPrincipal userPrincipal);
        Task<IActionResult> DisableTwoFactorAuthAsync(ClaimsPrincipal userPrincipal);
        Task<IActionResult> GetAllUsersAsync(string? searchQuery, string? status); //searchQuery: tìm kiếm, status: lọc
        Task<IActionResult> CreateUserAsync(CreateUserDto model);
        Task<IActionResult> ResetPasswordByAdminAsync(string targetUserId, AdminResetPasswordDto model);
        Task<IActionResult> LockUserAsync(string targetUserId);
        Task<IActionResult> UnlockUserAsync(string targetUserId);
    }
}