// IdentityServerAPI/Models/ApplicationUser.cs
using Microsoft.AspNetCore.Identity;
using System;

namespace IdentityServerAPI.Models
{
    public class ApplicationUser : IdentityUser<Guid>
    {
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        // public string FullName { get; set; } = string.Empty; 
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}