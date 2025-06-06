// IdentityServerAPI/Services/AuthService.cs
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using IdentityServerAPI.Models;
using IdentityServerAPI.DTOs;
using IdentityServerAPI.Services.Interfaces;
using IdentityServerAPI.Configuration; // Đảm bảo bạn có class JwtSettings ở đây
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using System.Web; // Cho HttpUtility
using IdentityServerAPI.Controllers;

namespace IdentityServerAPI.Services
{
    public class AuthService : IAuthService
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly IEmailService _emailService;
        private readonly IConfiguration _configuration;
        private readonly ILogger<AuthService> _logger;
        private readonly RoleManager<ApplicationRole> _roleManager;

        public AuthService(
            UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager,
            IEmailService emailService,
            IConfiguration configuration,
            ILogger<AuthService> logger,
            RoleManager<ApplicationRole> roleManager)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _emailService = emailService;
            _configuration = configuration;
            _logger = logger;
            _roleManager = roleManager;
        }

        public async Task<IActionResult> RegisterUserAsync(RegisterDto model, IUrlHelper url, string requestScheme)
        {
            var user = new ApplicationUser
            {
                UserName = model.Email,
                Email = model.Email,
                FirstName = model.FirstName,
                LastName = model.LastName,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            var result = await _userManager.CreateAsync(user, model.Password);

            if (!result.Succeeded)
            {
                _logger.LogWarning("User registration failed for {Email}: {Errors}", model.Email, string.Join(", ", result.Errors.Select(e => e.Description)));
                return new BadRequestObjectResult(new { title = "Đăng ký không thành công", errors = result.Errors.Select(e => new { e.Code, e.Description }) });
            }

            var defaultUserRole = "User";
            if (!await _userManager.IsInRoleAsync(user, defaultUserRole))
            {
                if (await _roleManager.RoleExistsAsync(defaultUserRole))
                {
                    await _userManager.AddToRoleAsync(user, defaultUserRole);
                    _logger.LogInformation("User {Email} added to role '{Role}'.", user.Email, defaultUserRole);
                }
                else
                {
                    _logger.LogWarning("Default role '{Role}' not found in database. Cannot assign to new user {Email}.", defaultUserRole, user.Email);
                }
            }

            var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);
            // var encodedToken = HttpUtility.UrlEncode(token); tạm thời
            // Ghi log token gốc để kiểm tra
            _logger.LogInformation("[REGISTER] Generated Raw Confirmation Token for UserId {UserId}: {Token}", user.Id, token);

            // V ---- SỬA ĐỔI CHÍNH Ở ĐÂY ---- V
            // Tạo link trỏ trực tiếp đến API backend /api/auth/confirmemail
            // IUrlHelper url và requestScheme được truyền vào từ AuthController
            var apiConfirmationLink = url.Action(
                action: nameof(AuthController.ConfirmEmail), // Tên phương thức trong AuthController
                controller: "Auth",                           // Tên controller (bỏ hậu tố "Controller")
                values: new { userId = user.Id.ToString(), token = token }, // userId là string
                protocol: requestScheme                       // http hoặc https
            );

            if (string.IsNullOrEmpty(apiConfirmationLink))
            {
                _logger.LogError("Could not generate API confirmation link. IUrlHelper or requestScheme might be an issue. Fallback link will be attempted but may not work as expected if frontend doesn't handle it.");
                return new ObjectResult(new { message = "Đăng ký thành công, nhưng có lỗi khi tạo link xác thực. Vui lòng liên hệ hỗ trợ." }) { StatusCode = 500 };
            }
            _logger.LogInformation("Generated API confirmation link for email (url.Action will handle encoding): {ApiConfirmationLink}", apiConfirmationLink);

            var subject = "Xác thực đăng ký tài khoản";
            string greetingName = !string.IsNullOrWhiteSpace(user.FirstName) ? user.FirstName : "bạn";
            // Sử dụng apiConfirmationLink trong email
            var message = $@"
                <p>Xin chào {greetingName},</p>
                <p>Cảm ơn bạn đã đăng ký tài khoản. Vui lòng xác minh địa chỉ email của bạn bằng cách nhấp vào liên kết sau:</p>
                <p><a href='{apiConfirmationLink}'>Xác nhận Email</a></p>
                <p>Nếu bạn không thể nhấp vào liên kết trên, vui lòng sao chép và dán URL sau vào trình duyệt của bạn:</p>
                <p>{apiConfirmationLink}</p>
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

        // Phương thức ConfirmUserEmailAsync giữ nguyên như code bạn đã cung cấp gần nhất,
        // vì nó đã xử lý redirect về /email-confirmed hoặc /login?params...
        public async Task<IActionResult> ConfirmUserEmailAsync(string userId, string token, string frontendLoginUrl)
        {
            string defaultRedirectBase = _configuration["FrontendUrls:Base"] ?? "http://localhost:3000";
            string loginPagePath = "login";
            string emailConfirmedPagePath = "email-confirmed";

            string targetLoginRedirectUrl = $"{defaultRedirectBase}/{loginPagePath}";
            string targetConfirmedPageRedirectUrl = $"{defaultRedirectBase}/{emailConfirmedPagePath}";

            if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(token))
            {
                _logger.LogWarning("ConfirmEmail: Invalid request parameters. UserId: {UserId}, Token is null/empty: {IsTokenNullOrEmpty}", userId, string.IsNullOrEmpty(token));
                return new RedirectResult($"{targetLoginRedirectUrl}?confirmationStatus=failed&reason=invalid_link");
            }

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                _logger.LogWarning("ConfirmEmail: User not found for UserId {UserId}", userId);
                return new RedirectResult($"{targetLoginRedirectUrl}?confirmationStatus=failed&reason=user_not_found");
            }

            var result = await _userManager.ConfirmEmailAsync(user, token);

            if (result.Succeeded)
            {
                _logger.LogInformation("Email confirmed successfully for user {UserId}", userId);
                return new RedirectResult(targetConfirmedPageRedirectUrl);
            }

            _logger.LogWarning("Email confirmation failed for user {UserId}: {Errors}", userId, string.Join(", ", result.Errors.Select(e => e.Description)));
            var errorMessages = string.Join(";", result.Errors.Select(e => e.Description));
            return new RedirectResult($"{targetLoginRedirectUrl}?confirmationStatus=failed&reason=confirmation_error&details={HttpUtility.UrlEncode(errorMessages)}");
        }

        // ... (Các phương thức LoginUserAsync, VerifyTwoFactorTokenAsync, GenerateJwtTokenResultAsync,
        //      ForgotPasswordAsync, ResetUserPasswordAsync, ChangeUserPasswordAsync giữ nguyên như code bạn đã cung cấp)
        //      Đảm bảo GenerateJwtTokenResultAsync vẫn là async Task<IActionResult> và trả về đầy đủ thông tin user.

        // Ví dụ: GenerateJwtTokenResultAsync (giữ nguyên từ lần sửa trước)
        private async Task<IActionResult> GenerateJwtTokenResultAsync(ApplicationUser user)
        {
            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email ?? string.Empty),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(JwtRegisteredClaimNames.Name, user.UserName ?? string.Empty)
            };

            if (!string.IsNullOrWhiteSpace(user.FirstName))
            {
                claims.Add(new Claim(ClaimTypes.GivenName, user.FirstName));
            }
            if (!string.IsNullOrWhiteSpace(user.LastName))
            {
                claims.Add(new Claim(ClaimTypes.Surname, user.LastName));
            }

            var roles = await _userManager.GetRolesAsync(user);
            foreach (var role in roles)
            {
                claims.Add(new Claim(ClaimTypes.Role, role));
            }

            var jwtSettingsSection = _configuration.GetSection("JwtSettings");
            var jwtSettings = jwtSettingsSection.Get<JwtSettings>();

            if (jwtSettings == null || string.IsNullOrEmpty(jwtSettings.SecretKey) || string.IsNullOrEmpty(jwtSettings.Issuer) || string.IsNullOrEmpty(jwtSettings.Audience))
            {
                _logger.LogError("JWT settings (SecretKey, Issuer, Audience, ExpiresInMinutes) are not properly configured.");
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
            return new OkObjectResult(new
            {
                token = tokenString,
                expiresIn = expires.ToString("o"),
                message = "Xác thực thành công.",
                user = new
                {
                    id = user.Id.ToString(),
                    email = user.Email,
                    userName = user.UserName,
                    firstName = user.FirstName,
                    lastName = user.LastName,
                    avatarUrl = user.AvatarUrl,
                    roles = roles
                }
            });
        }
        // ... (Các phương thức khác)
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
                return new ObjectResult(new {
                    message = "Email của bạn chưa được xác thực. Vui lòng kiểm tra hộp thư để hoàn tất xác thực.",
                    code = "EMAIL_NOT_CONFIRMED" // Mã lỗi cụ thể cho frontend
                }) { StatusCode = 403 }; // Forbidden
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
            if (user.TwoFactorEnabled)
            {
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
                    return new OkObjectResult(new {
                        requiresTwoFactor = true,
                        email = user.Email,
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

            return await GenerateJwtTokenResultAsync(user);
        }

        public async Task<IActionResult> VerifyTwoFactorTokenAsync(VerifyTwoFactorDto model)
        {
            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null)
            {
                _logger.LogWarning("Verify2FA: User not found for email {Email}", model.Email);
                return new BadRequestObjectResult(new { message = "Thông tin không hợp lệ hoặc mã OTP sai." });
            }

            var isValidOtp = await _userManager.VerifyTwoFactorTokenAsync(user, TokenOptions.DefaultEmailProvider, model.OtpCode);

            if (!isValidOtp)
            {
                _logger.LogWarning("Verify2FA: Invalid OTP for user {Email}. OTP: {Otp}", model.Email, model.OtpCode);
                return new BadRequestObjectResult(new { message = "Mã OTP không hợp lệ hoặc đã hết hạn." });
            }

            _logger.LogInformation("2FA OTP verified successfully for user {Email}", model.Email);

            return await GenerateJwtTokenResultAsync(user);
        }

        public async Task<IActionResult> ForgotPasswordAsync(ForgotPasswordDto model)
        {
            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null || !(await _userManager.IsEmailConfirmedAsync(user)))
            {
                _logger.LogInformation("Forgot password request for non-existent or unconfirmed email: {Email}", model.Email);
                return new OkObjectResult(new { message = "Nếu email của bạn tồn tại trong hệ thống và đã được xác nhận, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu." });
            }

            var otpToken = await _userManager.GeneratePasswordResetTokenAsync(user); // Token này là OTP

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
            return new OkObjectResult(new { message = "Mật khẩu đã được đặt lại thành công. Bạn có thể đăng nhập bằng mật khẩu mới ngay bây giờ." });
        }

        public async Task<IActionResult> ChangeUserPasswordAsync(ClaimsPrincipal userPrincipal, ChangePasswordDto model)
        {
            var userIdString = userPrincipal.FindFirstValue(ClaimTypes.NameIdentifier) ?? userPrincipal.FindFirstValue(JwtRegisteredClaimNames.Sub);

            if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out Guid userIdGuid))
            {
                _logger.LogWarning("ChangePasswordAsync: User ID not found or invalid in claims principal.");
                return new UnauthorizedObjectResult(new { message = "Người dùng không được xác thực hoặc thông tin không hợp lệ." });
            }

            var user = await _userManager.FindByIdAsync(userIdString);
            if (user == null)
            {
                _logger.LogWarning("ChangePasswordAsync: User not found for ID {UserId} from claims.", userIdString);
                return new UnauthorizedObjectResult(new { message = "Người dùng không hợp lệ." });
            }

            var changePasswordResult = await _userManager.ChangePasswordAsync(user, model.CurrentPassword, model.NewPassword);
            if (!changePasswordResult.Succeeded)
            {
                var errors = changePasswordResult.Errors.Select(e => new { code = e.Code, description = e.Description });
                _logger.LogWarning("Password change failed for user {UserId}: {Errors}", userIdString, string.Join(", ", changePasswordResult.Errors.Select(e => e.Description)));
                return new BadRequestObjectResult(new { title = "Đổi mật khẩu thất bại", errors = errors });
            }

            _logger.LogInformation("Password changed successfully for user {UserId}", userIdString);
            return new OkObjectResult(new { message = "Mật khẩu đã được thay đổi thành công." });
        }
    }
}