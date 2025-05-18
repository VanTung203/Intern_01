// IdentityServerAPI/Services/Interfaces/IUserService.cs
using IdentityServerAPI.DTOs.User;
using Microsoft.AspNetCore.Mvc; // Cho IActionResult
using System.Security.Claims;
using System.Threading.Tasks;

namespace IdentityServerAPI.Services.Interfaces
{
    public interface IUserService
    {
        Task<IActionResult> GetUserProfileAsync(ClaimsPrincipal userPrincipal);
        Task<IActionResult> UpdateUserProfileAsync(ClaimsPrincipal userPrincipal, UpdateUserProfileDto model);
    }
}