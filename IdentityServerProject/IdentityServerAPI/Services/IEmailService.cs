// IdentityServerAPI/Services/Interfaces/IEmailService.cs
using System.Threading.Tasks;

namespace IdentityServerAPI.Services.Interfaces
{
    public interface IEmailService
    {
        Task SendEmailAsync(string toEmail, string subject, string message);
    }
}