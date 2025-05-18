// IdentityServerAPI/Services/EmailService.cs
using MailKit.Net.Smtp;
using MimeKit;
using Microsoft.Extensions.Options;
using IdentityServerAPI.Configuration;
using IdentityServerAPI.Services.Interfaces; // Thêm using cho interface
using System.Threading.Tasks;
using System;

namespace IdentityServerAPI.Services
{
    public class EmailService : IEmailService // Implement IEmailService
    {
        private readonly EmailSettings _emailSettings;

        public EmailService(IOptions<EmailSettings> emailSettingsOptions)
        {
            _emailSettings = emailSettingsOptions.Value;
            if (_emailSettings == null ||
                string.IsNullOrEmpty(_emailSettings.SmtpServer) ||
                _emailSettings.SmtpPort <= 0 ||
                string.IsNullOrEmpty(_emailSettings.SenderEmail) ||
                string.IsNullOrEmpty(_emailSettings.Username) ||
                string.IsNullOrEmpty(_emailSettings.Password))
            {
                // Bạn có thể log lỗi ở đây nếu có ILogger được inject
                throw new InvalidOperationException("Email settings are not properly configured or missing.");
            }
        }

        public async Task SendEmailAsync(string toEmail, string subject, string message)
        {
            var email = new MimeMessage();
            email.From.Add(new MailboxAddress("Admin", _emailSettings.SenderEmail)); // Có thể muốn tên "Admin" này cũng là cấu hình
            email.To.Add(new MailboxAddress("", toEmail)); // Tên người nhận có thể để trống hoặc lấy từ đâu đó
            email.Subject = subject;
            email.Body = new TextPart(MimeKit.Text.TextFormat.Html) { Text = message }; // Thay đổi thành Html nếu message của có HTML

            using var smtp = new SmtpClient();
            try
            {
                // Cân nhắc thêm SecureSocketOptions dựa trên cấu hình SmtpPort
                var secureSocketOptions = _emailSettings.SmtpPort == 465 ? MailKit.Security.SecureSocketOptions.SslOnConnect : MailKit.Security.SecureSocketOptions.StartTlsWhenAvailable;
                await smtp.ConnectAsync(_emailSettings.SmtpServer, _emailSettings.SmtpPort, secureSocketOptions);
                await smtp.AuthenticateAsync(_emailSettings.Username, _emailSettings.Password);
                await smtp.SendAsync(email);
            }
            catch (Exception ex)
            {
                // Log lỗi chi tiết ở đây (ví dụ: dùng ILogger)
                // throw; // Ném lại lỗi hoặc xử lý theo cách khác
                throw new InvalidOperationException($"Failed to send email to {toEmail}. Error: {ex.Message}", ex);
            }
            finally
            {
                if (smtp.IsConnected)
                {
                    await smtp.DisconnectAsync(true);
                }
            }
        }
    }
}