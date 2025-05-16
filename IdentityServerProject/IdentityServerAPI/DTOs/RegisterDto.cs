// IdentityServerAPI/DTOs/RegisterDto.cs
namespace IdentityServerAPI.DTOs 
{
    public class RegisterDto
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        // public string FullName { get; set; } = string.Empty;
    }
}