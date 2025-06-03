// IdentityServerAPI/Services/AuthService.cs
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration; // Đảm bảo using này có
using Microsoft.Extensions.Logging;   // Đảm bảo using này có
using Microsoft.IdentityModel.Tokens;
using IdentityServerAPI.Models;
using IdentityServerAPI.DTOs; // Cần cho VerifyTwoFactorDto
using IdentityServerAPI.Services.Interfaces;
using IdentityServerAPI.Configuration;
using System; // Cho Guid, DateTime
using System.Collections.Generic; // Cho List<Claim>
using System.IdentityModel.Tokens.Jwt;
using System.Linq; // Cho Select
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks; // Cho Task
using System.Web;

namespace IdentityServerAPI.Services
{
    public class AuthService : IAuthService
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly IEmailService _emailService;
        private readonly IConfiguration _configuration;
        private readonly ILogger<AuthService> _logger;

        public AuthService(
            UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager,
            IEmailService emailService,
            IConfiguration configuration,
            ILogger<AuthService> logger)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _emailService = emailService;
            _configuration = configuration;
            _logger = logger;
        }

        public async Task<IActionResult> RegisterUserAsync(RegisterDto model, IUrlHelper url, string requestScheme)
        {
            var user = new ApplicationUser
            {
                UserName = model.Email,
                Email = model.Email,
                FirstName = model.FirstName,
                LastName = model.LastName
            };

            var result = await _userManager.CreateAsync(user, model.Password);

            if (!result.Succeeded)
            {
                _logger.LogWarning("User registration failed for {Email}: {Errors}", model.Email, string.Join(", ", result.Errors.Select(e => e.Description)));
                return new BadRequestObjectResult(new { title = "Đăng ký không thành công", errors = result.Errors.Select(e => new { e.Code, e.Description }) });
            }

            var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);
            var encodedToken = HttpUtility.UrlEncode(token);
            var confirmationLink = url.Action("ConfirmEmail", "Auth", new { userId = user.Id, token = encodedToken }, requestScheme);

            var subject = "Xác thực đăng ký tài khoản";
            string greetingName = !string.IsNullOrWhiteSpace(user.FirstName) ? user.FirstName : "bạn";
            var message = $@"
                <p>Xin chào {greetingName},</p>
                <p>Cảm ơn bạn đã đăng ký tài khoản. Vui lòng xác minh địa chỉ email của bạn bằng cách nhấp vào liên kết sau:</p>
                <p><a href='{confirmationLink}'>Xác nhận Email</a></p>
                <p>Nếu bạn không thể nhấp vào liên kết trên, vui lòng sao chép và dán URL sau vào trình duyệt của bạn:</p>
                <p>{confirmationLink}</p>
                <p>Trân trọng,</p>
                <p>Đội ngũ hỗ trợ.</p>";

            try
            {
                await _emailService.SendEmailAsync(model.Email, subject, message);
                _logger.LogInformation("Confirmation email sent to {Email}", model.Email);
                return new OkObjectResult(new { message = "Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send confirmation email to {Email}", model.Email);
                return new OkObjectResult(new { message = "Đăng ký thành công, nhưng có lỗi khi gửi email xác thực. Vui lòng liên hệ hỗ trợ nếu bạn không nhận được email." });
            }
        }

        public async Task<IActionResult> ConfirmUserEmailAsync(string userId, string token, string frontendLoginUrl)
        {
            string defaultFrontendLoginUrl = _configuration["FrontendLoginUrl"] ?? "http://localhost:3000/login";
            string targetRedirectUrl = !string.IsNullOrWhiteSpace(frontendLoginUrl) ? frontendLoginUrl : defaultFrontendLoginUrl;

            if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(token))
            {
                _logger.LogWarning("ConfirmEmail: Invalid request parameters. UserId: {UserId}, Token is null/empty: {IsTokenNullOrEmpty}", userId, string.IsNullOrEmpty(token));
                return new OkObjectResult(new { redirectTo = $"{targetRedirectUrl}?success=false&message=InvalidConfirmationLink" });
            }

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                _logger.LogWarning("ConfirmEmail: User not found for UserId {UserId}", userId);
                return new OkObjectResult(new { redirectTo = $"{targetRedirectUrl}?success=false&message=UserNotFoundForConfirmation" });
            }

            var decodedToken = HttpUtility.UrlDecode(token);
            var result = await _userManager.ConfirmEmailAsync(user, decodedToken);

            if (result.Succeeded)
            {
                _logger.LogInformation("Email confirmed successfully for user {UserId}", userId);
                return new OkObjectResult(new { redirectTo = $"{targetRedirectUrl}?success=true&message=EmailConfirmed" });
            }

            _logger.LogWarning("Email confirmation failed for user {UserId}: {Errors}", userId, string.Join(", ", result.Errors.Select(e => e.Description)));
            var errorMessages = string.Join(";", result.Errors.Select(e => e.Description));
            return new OkObjectResult(new { redirectTo = $"{targetRedirectUrl}?success=false&message=EmailConfirmationFailed&errors={HttpUtility.UrlEncode(errorMessages)}" });
        }

        // >>> SỬA ĐỔI LoginUserAsync ĐỂ XỬ LÝ 2FA <<<
        public async Task<IActionResult> LoginUserAsync(LoginDto model)
        {
            var user = await _userManager.FindByEmailAsync(model.Email);

            if (user == null)
            {
                _logger.LogWarning("Login attempt for non-existent email: {Email}", model.Email);
                return new UnauthorizedObjectResult(new { message = "Email hoặc mật khẩu không đúng." });
            }

            if (!await _userManager.IsEmailConfirmedAsync(user))
            {
                _logger.LogWarning("Login attempt for unconfirmed email: {Email}", model.Email);
                return new ObjectResult(new { message = "Email của bạn chưa được xác thực. Vui lòng kiểm tra hộp thư để hoàn tất xác thực.", requireEmailConfirmation = true }) { StatusCode = 403 };
            }

            var signInResult = await _signInManager.CheckPasswordSignInAsync(user, model.Password, lockoutOnFailure: true);

            if (!signInResult.Succeeded)
            {
                if (signInResult.IsLockedOut)
                {
                    _logger.LogWarning("User account locked out: {Email}", model.Email);
                    return new UnauthorizedObjectResult(new { message = "Tài khoản của bạn đã bị tạm khóa do nhập sai mật khẩu nhiều lần. Vui lòng thử lại sau." });
                }
                _logger.LogWarning("Invalid password attempt for user: {Email}", model.Email);
                return new UnauthorizedObjectResult(new { message = "Email hoặc mật khẩu không đúng." });
            }

            // --- BẮT ĐẦU LOGIC XỬ LÝ 2FA ---
            if (user.TwoFactorEnabled) // Thuộc tính TwoFactorEnabled có sẵn trong MongoIdentityUser
            {
                // Tạo mã OTP 2FA, sử dụng provider "Email" (TokenOptions.DefaultEmailProvider)
                var otpToken = await _userManager.GenerateTwoFactorTokenAsync(user, TokenOptions.DefaultEmailProvider);

                var subject = "Mã Xác Thực 2 lớp (2FA)";
                string greetingName = !string.IsNullOrWhiteSpace(user.FirstName) ? user.FirstName : user.Email;
                var messageBody = $@"
                    <p>Xin chào {greetingName},</p>
                    <p>Mã OTP xác thực 2 lớp của bạn là: <strong>{otpToken}</strong></p>
                    <p>Mã này sẽ hết hạn sau vài phút. Vui lòng nhập mã này để hoàn tất đăng nhập.</p>
                    <p>Nếu bạn không thực hiện yêu cầu đăng nhập này, vui lòng bỏ qua email này.</p>";
                try
                {
                    await _emailService.SendEmailAsync(user.Email, subject, messageBody);
                    _logger.LogInformation("2FA OTP sent to {Email}", user.Email);
                    // Trả về cho frontend biết rằng cần xác thực 2FA
                    return new OkObjectResult(new {
                        requiresTwoFactor = true,
                        email = user.Email, // Gửi lại email để frontend có thể dùng khi gọi API verify-2fa
                        message = "Yêu cầu xác thực 2 lớp. Vui lòng kiểm tra email của bạn để nhận mã OTP."
                    });
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to send 2FA OTP to {Email}", user.Email);
                    return new ObjectResult(new { message = "Đã xảy ra lỗi khi gửi mã OTP xác thực. Vui lòng thử lại." }) { StatusCode = 500 };
                }
            }
            // --- KẾT THÚC LOGIC XỬ LÝ 2FA ---

            // Nếu 2FA không được bật, tạo và trả về JWT token như bình thường
            return GenerateJwtTokenResult(user);
        }

        // >>> THÊM PHƯƠNG THỨC VerifyTwoFactorTokenAsync <<<
        public async Task<IActionResult> VerifyTwoFactorTokenAsync(VerifyTwoFactorDto model)
        {
            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null)
            {
                _logger.LogWarning("Verify2FA: User not found for email {Email}", model.Email);
                return new BadRequestObjectResult(new { message = "Thông tin không hợp lệ hoặc mã OTP sai." });
            }

            // Xác thực mã OTP, sử dụng provider "Email"
            var isValidOtp = await _userManager.VerifyTwoFactorTokenAsync(user, TokenOptions.DefaultEmailProvider, model.OtpCode);

            if (!isValidOtp)
            {
                _logger.LogWarning("Verify2FA: Invalid OTP for user {Email}. OTP: {Otp}", model.Email, model.OtpCode);
                // Cân nhắc việc ghi log số lần thử sai và khóa tài khoản nếu thử quá nhiều lần
                return new BadRequestObjectResult(new { message = "Mã OTP không hợp lệ hoặc đã hết hạn." });
            }

            _logger.LogInformation("2FA OTP verified successfully for user {Email}", model.Email);

            // Nếu OTP hợp lệ, tạo và trả về JWT token
            return GenerateJwtTokenResult(user);
        }

        // --- TÁCH LOGIC TẠO JWT TOKEN RA HÀM RIÊNG ĐỂ TÁI SỬ DỤNG ---
        private IActionResult GenerateJwtTokenResult(ApplicationUser user)
        {
            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email ?? string.Empty),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            };

            if (!string.IsNullOrWhiteSpace(user.FirstName))
            {
                claims.Add(new Claim(ClaimTypes.GivenName, user.FirstName));
            }
            if (!string.IsNullOrWhiteSpace(user.LastName))
            {
                claims.Add(new Claim(ClaimTypes.Surname, user.LastName));
            }
            // Lấy roles của user và thêm vào claims (đảm bảo GetRolesAsync không ném lỗi nếu không có UserRoleStore)
            // UserManager sẽ tự xử lý việc này.
            var roles = _userManager.GetRolesAsync(user).Result; // .Result ở đây là an toàn vì GetRolesAsync của UserManager không thực sự là async operation nếu đã load user
            foreach (var role in roles)
            {
                claims.Add(new Claim(ClaimTypes.Role, role));
            }

            var jwtSettingsSection = _configuration.GetSection("JwtSettings");
            var jwtSettings = jwtSettingsSection.Get<JwtSettings>();

            if (jwtSettings == null || string.IsNullOrEmpty(jwtSettings.SecretKey) || string.IsNullOrEmpty(jwtSettings.Issuer) || string.IsNullOrEmpty(jwtSettings.Audience))
            {
                _logger.LogError("JWT settings are not properly configured.");
                return new ObjectResult(new { message = "Lỗi cấu hình máy chủ xác thực." }) { StatusCode = 500 };
            }

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.SecretKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256Signature);
            var expires = DateTime.UtcNow.AddMinutes(jwtSettings.ExpiresInMinutes > 0 ? jwtSettings.ExpiresInMinutes : 60);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = expires,
                Issuer = jwtSettings.Issuer,
                Audience = jwtSettings.Audience,
                SigningCredentials = creds
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var securityToken = tokenHandler.CreateToken(tokenDescriptor);
            var tokenString = tokenHandler.WriteToken(securityToken);

            _logger.LogInformation("JWT token generated for user {Email}", user.Email);
            return new OkObjectResult(new { token = tokenString, expiresIn = expires, message = "Xác thực thành công." });
        }

        public async Task<IActionResult> ForgotPasswordAsync(ForgotPasswordDto model)
        {
            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null || !(await _userManager.IsEmailConfirmedAsync(user)))
            {
                _logger.LogInformation("Forgot password request for non-existent or unconfirmed email: {Email}", model.Email);
                return new OkObjectResult(new { message = "Nếu email của bạn tồn tại trong hệ thống và đã được xác nhận, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu." });
            }

            var otpToken = await _userManager.GeneratePasswordResetTokenAsync(user);

            string greetingName = !string.IsNullOrWhiteSpace(user.FirstName) ? user.FirstName : "bạn";
            var subject = "Mã OTP Đặt Lại Mật Khẩu Của Bạn";
            var messageBody = $@"
                <p>Xin chào {greetingName},</p>
                <p>Mã OTP (Mật khẩu một lần) để đặt lại mật khẩu của bạn là: <strong>{otpToken}</strong></p>
                <p>Mã OTP này bao gồm 6 chữ số và sẽ hết hạn sau khoảng 3-5 phút. Vui lòng nhập mã này vào trang đặt lại mật khẩu để tiếp tục.</p>
                <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
                <p>Trân trọng,</p>
                <p>Đội ngũ hỗ trợ.</p>";
            try
            {
                await _emailService.SendEmailAsync(user.Email, subject, messageBody);
                _logger.LogInformation("Password reset OTP sent to {Email}", user.Email);
                return new OkObjectResult(new { message = "Mã OTP đặt lại mật khẩu đã được gửi đến email của bạn." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send password reset OTP to {Email}", user.Email);
                return new ObjectResult(new { message = "Đã xảy ra lỗi khi gửi email. Vui lòng thử lại sau." }) { StatusCode = 500 };
            }
        }

        public async Task<IActionResult> ResetUserPasswordAsync(ResetPasswordDto model)
        {
            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null)
            {
                _logger.LogWarning("Reset password attempt for non-existent email: {Email}", model.Email);
                return new BadRequestObjectResult(new { title = "Đặt lại mật khẩu không thành công.", errors = new[] { new { Code = "InvalidRequest", Description = "Yêu cầu đặt lại mật khẩu không hợp lệ hoặc mã OTP không đúng." } } });
            }

            var result = await _userManager.ResetPasswordAsync(user, model.Token, model.NewPassword);

            if (!result.Succeeded)
            {
                var errors = result.Errors.ToList();
                _logger.LogWarning("Password reset failed for user {Email}: {Errors}", model.Email, string.Join(", ", errors.Select(e => e.Description)));
                if (errors.Any(e => e.Code == "InvalidToken"))
                {
                    return new BadRequestObjectResult(new { title = "Đặt lại mật khẩu không thành công.", errors = new[] { new { Code = "InvalidOtp", Description = "Mã OTP không hợp lệ hoặc đã hết hạn. Vui lòng thử yêu cầu mã mới." } } });
                }
                return new BadRequestObjectResult(new { title = "Đặt lại mật khẩu không thành công.", errors = errors.Select(e => new { e.Code, e.Description }) });
            }

            _logger.LogInformation("Password reset successfully for user {Email}", model.Email);
            return new OkObjectResult(new { message = "Đặt lại mật khẩu thành công. Bạn có thể đăng nhập bằng mật khẩu mới." });
        }

        public async Task<IActionResult> ChangeUserPasswordAsync(ClaimsPrincipal userPrincipal, ChangePasswordDto model)
        {
            var userId = _userManager.GetUserId(userPrincipal);
             if (string.IsNullOrEmpty(userId))
            {
                _logger.LogWarning("ChangePasswordAsync: User ID not found in claims principal.");
                return new UnauthorizedObjectResult(new { message = "Người dùng không được xác thực hoặc thông tin không hợp lệ." });
            }

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                _logger.LogWarning("ChangePasswordAsync: User not found for ID {UserId} from claims.", userId);
                return new UnauthorizedObjectResult(new { message = "Người dùng không hợp lệ." });
            }

            var changePasswordResult = await _userManager.ChangePasswordAsync(user, model.CurrentPassword, model.NewPassword);
            if (!changePasswordResult.Succeeded)
            {
                var errors = changePasswordResult.Errors.Select(e => new { code = e.Code, description = e.Description });
                _logger.LogWarning("Password change failed for user {UserId}: {Errors}", userId, string.Join(", ", changePasswordResult.Errors.Select(e => e.Description)));
                return new BadRequestObjectResult(new { title = "Đổi mật khẩu thất bại", errors = errors });
            }

            _logger.LogInformation("Password changed successfully for user {UserId}", userId);
            return new OkObjectResult(new { message = "Mật khẩu đã được thay đổi thành công." });
        }
    }
}