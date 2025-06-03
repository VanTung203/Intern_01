// IdentityServerAPI/Services/AuthService.cs
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration; // Đã có
using Microsoft.Extensions.Logging; // Thêm để log lỗi nếu cần
using Microsoft.IdentityModel.Tokens;
using IdentityServerAPI.Models;
using IdentityServerAPI.DTOs;
using IdentityServerAPI.Services.Interfaces;
using IdentityServerAPI.Configuration; // Cho JwtSettings
using System;
using System.Collections.Generic; // Cho List<Claim>
using System.IdentityModel.Tokens.Jwt;
using System.Linq; // Cho Select
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using System.Web; // Cho HttpUtility

namespace IdentityServerAPI.Services
{
    public class AuthService : IAuthService
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly IEmailService _emailService;
        private readonly IConfiguration _configuration;
        private readonly ILogger<AuthService> _logger; // Thêm logger

        public AuthService(
            UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager,
            IEmailService emailService,
            IConfiguration configuration,
            ILogger<AuthService> logger) // Inject ILogger
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _emailService = emailService;
            _configuration = configuration;
            _logger = logger; // Gán logger
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
            // Mã hóa token cho URL để đảm bảo an toàn
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
                // Không nên fail cả quá trình đăng ký nếu chỉ gửi email lỗi, nhưng cần log lại
                // Cân nhắc việc xóa user nếu không gửi được email xác thực, hoặc cho phép admin resend.
                return new OkObjectResult(new { message = "Đăng ký thành công, nhưng có lỗi khi gửi email xác thực. Vui lòng liên hệ hỗ trợ nếu bạn không nhận được email." });
            }
        }

        public async Task<IActionResult> ConfirmUserEmailAsync(string userId, string token, string frontendLoginUrl)
        {
            // Frontend nên cung cấp URL đầy đủ, bao gồm scheme và host
            string defaultFrontendLoginUrl = _configuration["FrontendLoginUrl"] ?? "http://localhost:3000/login"; // Cung cấp fallback
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

            // Giải mã token từ URL
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
                // Trả về thông báo yêu cầu xác thực email
                return new ObjectResult(new { message = "Email của bạn chưa được xác thực. Vui lòng kiểm tra hộp thư để hoàn tất xác thực.", requireEmailConfirmation = true }) { StatusCode = 403 }; // 403 Forbidden
            }

            // Sử dụng SignInManager để kiểm tra mật khẩu và xử lý lockout
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


            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email ?? string.Empty),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()), // Thêm Jti để có thể revoke token nếu cần
            };

            if (!string.IsNullOrWhiteSpace(user.FirstName))
            {
                claims.Add(new Claim(ClaimTypes.GivenName, user.FirstName)); // Sử dụng ClaimTypes chuẩn
            }
            if (!string.IsNullOrWhiteSpace(user.LastName))
            {
                claims.Add(new Claim(ClaimTypes.Surname, user.LastName)); // Sử dụng ClaimTypes chuẩn
            }
             // Lấy roles của user và thêm vào claims
            var roles = await _userManager.GetRolesAsync(user);
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
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256Signature); // Sử dụng HmacSha256Signature
            var expires = DateTime.UtcNow.AddMinutes(jwtSettings.ExpiresInMinutes > 0 ? jwtSettings.ExpiresInMinutes : 60); // UTCNow

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = expires,
                Issuer = jwtSettings.Issuer,
                Audience = jwtSettings.Audience,
                SigningCredentials = creds
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var securityToken = tokenHandler.CreateToken(tokenDescriptor); // Đổi tên biến
            var tokenString = tokenHandler.WriteToken(securityToken);

            _logger.LogInformation("User {Email} logged in successfully.", model.Email);
            return new OkObjectResult(new { token = tokenString, expiresIn = expires, message = "Đăng nhập thành công." });
        }

        // >>> THAY ĐỔI CHÍNH Ở ĐÂY <<<
        public async Task<IActionResult> ForgotPasswordAsync(ForgotPasswordDto model)
        {
            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null || !(await _userManager.IsEmailConfirmedAsync(user)))
            {
                // Không tiết lộ sự tồn tại của email hoặc trạng thái xác nhận
                _logger.LogInformation("Forgot password request for non-existent or unconfirmed email: {Email}", model.Email);
                return new OkObjectResult(new { message = "Nếu email của bạn tồn tại trong hệ thống và đã được xác nhận, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu." });
            }

            // GeneratePasswordResetTokenAsync giờ sẽ sử dụng EmailTokenProvider
            // và trả về mã OTP 6 số do cấu hình ở Program.cs
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
                // Trả về thông báo lỗi chung cho client, nhưng log chi tiết lỗi server-side
                return new ObjectResult(new { message = "Đã xảy ra lỗi khi gửi email. Vui lòng thử lại sau." }) { StatusCode = 500 };
            }
        }

        // >>> CẬP NHẬT XỬ LÝ LỖI CHO ResetUserPasswordAsync <<<
        public async Task<IActionResult> ResetUserPasswordAsync(ResetPasswordDto model)
        {
            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null)
            {
                _logger.LogWarning("Reset password attempt for non-existent email: {Email}", model.Email);
                // Thông báo chung để không tiết lộ sự tồn tại của email
                return new BadRequestObjectResult(new { title = "Đặt lại mật khẩu không thành công.", errors = new[] { new { Code = "InvalidRequest", Description = "Yêu cầu đặt lại mật khẩu không hợp lệ hoặc mã OTP không đúng." } } });
            }

            // model.Token bây giờ là mã OTP 6 số người dùng nhập vào
            var result = await _userManager.ResetPasswordAsync(user, model.Token, model.NewPassword);

            if (!result.Succeeded)
            {
                var errors = result.Errors.ToList();
                _logger.LogWarning("Password reset failed for user {Email}: {Errors}", model.Email, string.Join(", ", errors.Select(e => e.Description)));

                // Kiểm tra lỗi cụ thể liên quan đến token
                if (errors.Any(e => e.Code == "InvalidToken"))
                {
                    return new BadRequestObjectResult(new { title = "Đặt lại mật khẩu không thành công.", errors = new[] { new { Code = "InvalidOtp", Description = "Mã OTP không hợp lệ hoặc đã hết hạn. Vui lòng thử yêu cầu mã mới." } } });
                }
                // Các lỗi khác (ví dụ: mật khẩu không đủ mạnh)
                return new BadRequestObjectResult(new { title = "Đặt lại mật khẩu không thành công.", errors = errors.Select(e => new { e.Code, e.Description }) });
            }

            _logger.LogInformation("Password reset successfully for user {Email}", model.Email);
            return new OkObjectResult(new { message = "Đặt lại mật khẩu thành công. Bạn có thể đăng nhập bằng mật khẩu mới." });
        }

        public async Task<IActionResult> ChangeUserPasswordAsync(ClaimsPrincipal userPrincipal, ChangePasswordDto model)
        {
            var userId = _userManager.GetUserId(userPrincipal); // Lấy UserId từ ClaimsPrincipal
             if (string.IsNullOrEmpty(userId))
            {
                _logger.LogWarning("ChangePasswordAsync: User ID not found in claims principal.");
                return new UnauthorizedObjectResult(new { message = "Người dùng không được xác thực hoặc thông tin không hợp lệ." });
            }

            var user = await _userManager.FindByIdAsync(userId); // Tìm user bằng ID
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