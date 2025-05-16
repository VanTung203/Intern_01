// IdentityServerAPI/Services/AuthService.cs
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using IdentityServerAPI.Models;
using IdentityServerAPI.DTOs; // Hoặc IdentityServerAPI.DTOs.Auth
using IdentityServerAPI.Services.Interfaces;
using IdentityServerAPI.Configuration; // Cho JwtSettings
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
// using System.Web; // Cho HttpUtility sau này nếu cần

namespace IdentityServerAPI.Services
{
    public class AuthService : IAuthService
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly IEmailService _emailService; // Sửa thành IEmailService
        private readonly IConfiguration _configuration;

        public AuthService(
            UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager,
            IEmailService emailService, // Inject IEmailService
            IConfiguration configuration)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _emailService = emailService;
            _configuration = configuration;
        }

        public async Task<IActionResult> RegisterUserAsync(RegisterDto model, IUrlHelper url, string requestScheme)
        {
            var user = new ApplicationUser
            {
                UserName = model.Email,
                Email = model.Email,
                FirstName = model.FirstName, // Gán FirstName
                LastName = model.LastName   // Gán LastName
            };

            var result = await _userManager.CreateAsync(user, model.Password);

            if (!result.Succeeded)
                return new BadRequestObjectResult(new { title = "Đăng ký không thành công", errors = result.Errors.Select(e => new { e.Code, e.Description }) });

            var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);
            // Url.Action cần controller name và action name đúng.
            // Giả sử ConfirmEmail action nằm trong AuthController
            var confirmationLink = url.Action("ConfirmEmail", "Auth", new { userId = user.Id, token = token }, requestScheme);

            var subject = "Xác thực đăng ký tài khoản";
            // Sử dụng FirstName để chào hỏi nếu có, hoặc một lời chào chung
            string greetingName = !string.IsNullOrWhiteSpace(user.FirstName) ? user.FirstName : "bạn";
            var message = $"Xin chào {greetingName},\n\nVui lòng xác minh email của bạn bằng cách nhấp vào liên kết sau:\n{confirmationLink}";
            
            await _emailService.SendEmailAsync(model.Email, subject, message);

            return new OkObjectResult(new { message = "Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản." });
        }

        public async Task<IActionResult> ConfirmUserEmailAsync(string userId, string token, string frontendLoginUrl)
        {
            if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(token))
                return new BadRequestObjectResult(new { message = "Yêu cầu không hợp lệ." });

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return new BadRequestObjectResult(new { message = "Không tìm thấy người dùng." });

            var result = await _userManager.ConfirmEmailAsync(user, token);
            if (result.Succeeded)
            {
                return new OkObjectResult(new { redirectTo = frontendLoginUrl, message = "Xác thực email thành công." });
            }
            return new BadRequestObjectResult(new { message = "Xác minh email thất bại." });
        }

        public async Task<IActionResult> LoginUserAsync(LoginDto model)
        {
            var user = await _userManager.FindByEmailAsync(model.Email);

            if (user == null || !await _userManager.CheckPasswordAsync(user, model.Password))
            {
                return new UnauthorizedObjectResult(new { message = "Email hoặc mật khẩu không đúng." });
            }

            if (!await _userManager.IsEmailConfirmedAsync(user))
            {
                return new UnauthorizedObjectResult(new { message = "Email chưa được xác thực." });
            }

            var claims = new List<Claim> // Sử dụng List<Claim> để dễ dàng thêm claim có điều kiện
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email ?? string.Empty),
            };

            if (!string.IsNullOrWhiteSpace(user.FirstName))
            {
                claims.Add(new Claim("firstName", user.FirstName)); // Hoặc ClaimTypes.GivenName
            }
            if (!string.IsNullOrWhiteSpace(user.LastName))
            {
                claims.Add(new Claim("lastName", user.LastName));   // Hoặc ClaimTypes.Surname
            }
            // Không còn claim "FullName"

            var jwtSettingsSection = _configuration.GetSection("JwtSettings");
            var jwtSettings = jwtSettingsSection.Get<JwtSettings>();

            if (jwtSettings == null || string.IsNullOrEmpty(jwtSettings.SecretKey) || string.IsNullOrEmpty(jwtSettings.Issuer) || string.IsNullOrEmpty(jwtSettings.Audience))
            {
                // Log lỗi cấu hình nghiêm trọng
                // throw new InvalidOperationException("JWT settings are not properly configured.");
                return new ObjectResult(new { message = "Lỗi cấu hình máy chủ." }) { StatusCode = 500 };
            }

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.SecretKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var expires = DateTime.Now.AddMinutes(jwtSettings.ExpiresInMinutes > 0 ? jwtSettings.ExpiresInMinutes : 60);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = expires,
                Issuer = jwtSettings.Issuer,
                Audience = jwtSettings.Audience,
                SigningCredentials = creds
            };
            
            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);
            var tokenString = tokenHandler.WriteToken(token);

            return new OkObjectResult(new { token = tokenString, expiresIn = expires });
        }

        public async Task<IActionResult> ForgotPasswordAsync(ForgotPasswordDto model)
        {
            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null)
            {
                return new OkObjectResult(new { message = "Nếu tài khoản của bạn tồn tại, một email chứa hướng dẫn đặt lại mật khẩu đã được gửi." });
            }

            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            
            string greetingName = !string.IsNullOrWhiteSpace(user.FirstName) ? user.FirstName : "bạn";
            var subject = "Yêu cầu đặt lại mật khẩu";
            var messageBody = $"Xin chào {greetingName},\n\nMã token đặt lại mật khẩu của bạn là:\n\n{token}\n\nSử dụng mã này để đặt lại mật khẩu của bạn. Mã này sẽ hết hạn sau một khoảng thời gian ngắn.";

            await _emailService.SendEmailAsync(user.Email, subject, messageBody);

            return new OkObjectResult(new { message = "Nếu tài khoản của bạn tồn tại, một email chứa hướng dẫn đặt lại mật khẩu đã được gửi." });
        }

        public async Task<IActionResult> ResetUserPasswordAsync(ResetPasswordDto model)
        {
            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null)
            {
                return new BadRequestObjectResult(new { message = "Yêu cầu đặt lại mật khẩu không hợp lệ hoặc đã hết hạn." });
            }

            var result = await _userManager.ResetPasswordAsync(user, model.Token, model.NewPassword);

            if (!result.Succeeded)
            {
                var errors = result.Errors.Select(e => new { e.Code, e.Description });
                return new BadRequestObjectResult(new { title = "Đặt lại mật khẩu không thành công.", errors = errors });
            }

            return new OkObjectResult(new { message = "Đặt lại mật khẩu thành công. Bạn có thể đăng nhập bằng mật khẩu mới." });
        }
    }
}