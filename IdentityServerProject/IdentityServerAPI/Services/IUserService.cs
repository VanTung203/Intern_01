// IdentityServerAPI/Services/Interfaces/IUserService.cs
using IdentityServerAPI.DTOs.User;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
//using System.Threading.Tasks;

namespace IdentityServerAPI.Services.Interfaces
{
    public interface IUserService
    {
        Task<IActionResult> GetUserProfileAsync(ClaimsPrincipal userPrincipal);
        Task<IActionResult> UpdateUserProfileAsync(ClaimsPrincipal userPrincipal, UpdateUserProfileDto model);
        Task<IActionResult> EnableTwoFactorAuthAsync(ClaimsPrincipal userPrincipal);
        Task<IActionResult> DisableTwoFactorAuthAsync(ClaimsPrincipal userPrincipal);
    }
}