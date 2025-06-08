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
        Task<IActionResult> GetAllUsersAsync();

        Task<IActionResult> CreateUserAsync(CreateUserDto model);
    }
}