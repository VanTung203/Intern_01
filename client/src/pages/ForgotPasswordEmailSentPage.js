// client/src/pages/ForgotPasswordEmailSentPage.js
import React, { useState, useEffect } from 'react'; // Thêm useEffect nếu cần cho countdown
import { Box, Typography, Paper, Button, Link as MuiLink, Alert, CircularProgress } from '@mui/material';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
// import MailOutlineIcon from '@mui/icons-material/MailOutline'; // Icon này có thể không cần nếu đã có ảnh minh họa
import LoopIcon from '@mui/icons-material/Loop';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'; // Icon cho nút "Tiếp tục"
import PublicPageLayout from '../components/layouts/PublicPageLayout'; // Đảm bảo đường dẫn đúng
import { forgotPassword } from '../services/authService';

// Component Logo (nếu PublicPageLayout chưa có, nhưng thường là có)
// const VietbandoLogoWithText = () => ( /* ... */ );

const ForgotPasswordEmailSentPageContent = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const email = location.state?.emailSentTo; // Lấy email từ ForgotPasswordPage
    const messageFromServer = location.state?.messageFromServer || "Nếu tài khoản của bạn tồn tại, một email chứa hướng dẫn đặt lại mật khẩu đã được gửi.";

    const [resendApiMessage, setResendApiMessage] = useState(null); // {type, text} cho việc gửi lại email
    const [isResending, setIsResending] = useState(false);
    // Logic đếm ngược (ví dụ)
    const RESEND_TIMEOUT_SECONDS = 60;
    const [countdown, setCountdown] = useState(RESEND_TIMEOUT_SECONDS);
    const [canResend, setCanResend] = useState(false);

    useEffect(() => {
        if (!email) {
            // Nếu không có email, có thể người dùng truy cập trực tiếp URL
            // Chuyển họ về trang forgot-password để bắt đầu lại
            console.warn("ForgotPasswordEmailSentPage: Email không được cung cấp qua state. Chuyển hướng về /forgot-password.");
            navigate('/forgot-password', { replace: true });
        }
    }, [email, navigate]);

    useEffect(() => {
        let timerId;
        if (!canResend && countdown > 0) {
            timerId = setInterval(() => {
                setCountdown((prevCountdown) => prevCountdown - 1);
            }, 1000);
        } else if (countdown === 0) {
            setCanResend(true);
            setCountdown(0); // Giữ ở 0 khi đã có thể gửi lại
        }
        return () => clearInterval(timerId);
    }, [countdown, canResend]);

    const handleResendEmail = async () => {
        if (!email || !canResend || isResending) {
            return;
        }
        setIsResending(true);
        setResendApiMessage(null);
        try {
            await forgotPassword({ email }); // Gọi lại API forgotPassword
            setResendApiMessage({ type: 'success', text: `Đã gửi lại email đến ${email}.` });
            setCanResend(false); // Vô hiệu hóa nút gửi lại
            setCountdown(RESEND_TIMEOUT_SECONDS); // Reset đếm ngược
        } catch (error) {
            setResendApiMessage({ type: 'error', text: error.response?.data?.message || 'Không thể gửi lại email. Vui lòng thử lại sau.' });
        } finally {
            setIsResending(false);
        }
    };

    const handleGoToResetPassword = () => {
        if (email) {
            navigate('/reset-password', { state: { emailToReset: email } }); // Truyền email sang trang reset
        } else {
            // Điều này không nên xảy ra nếu useEffect ở trên hoạt động đúng
            alert("Thông tin email không hợp lệ để tiếp tục.");
            navigate('/forgot-password', { replace: true });
        }
    };

    if (!email) { // Trong trường hợp useEffect chưa kịp redirect
        return (
            <Box sx={{p:3, textAlign:'center'}}>
                <CircularProgress />
                <Typography>Đang tải thông tin...</Typography>
            </Box>
        );
    }

    return (
        <Paper
            elevation={0}
            square
            sx={{
                pl: { xs: 2.5, sm: 6, md: 8, lg: 30 },
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                backgroundColor: 'transparent',
                width: '100%',
                maxWidth: 700,
            }}
        >
            <img
                src={`${process.env.PUBLIC_URL}/verify_email.png`} // Đảm bảo có ảnh này
                alt="Email Sent"
                style={{ width: '100px', height: '100px', marginBottom: '20px' }}
            />
            <Typography component="h1" variant="h5" sx={{ fontWeight: 'bold', mb: 1.5 }}>
                Kiểm tra email của bạn
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                {messageFromServer} {/* Hiển thị thông báo từ server nếu có */}
            </Typography>
            {email && (
                <Typography variant="body1" color="text.primary" sx={{ fontWeight: 'bold', mb: 2.5 }}>
                    {email}
                </Typography>
            )}
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Vui lòng kiểm tra hộp thư đến (và cả thư mục spam) để tìm mã token. Sau đó, nhấp vào nút bên dưới để đặt lại mật khẩu.
            </Typography>

            {resendApiMessage && <Alert severity={resendApiMessage.type} sx={{mb:2, width:'100%'}} onClose={() => setResendApiMessage(null)}>{resendApiMessage.text}</Alert>}

            <Button
                variant="contained" // Làm nút này nổi bật
                color="primary"
                onClick={handleGoToResetPassword}
                endIcon={<ArrowForwardIcon />} // Icon mũi tên
                sx={{ mb: 2, py: 1.25, px: 3, width: '100%', maxWidth: '300px' }}
            >
                Nhập Token & Đặt lại mật khẩu
            </Button>

            <Button
                variant="text"
                startIcon={isResending ? <CircularProgress size={16} color="inherit" /> : <LoopIcon sx={{ fontSize: '1rem' }} />}
                onClick={handleResendEmail}
                disabled={!canResend || isResending}
                sx={(theme) =>({
                    textTransform: 'none',
                    color: !canResend ? theme.palette.text.disabled : theme.palette.text.secondary,
                    fontSize: '0.8rem',
                    fontWeight: 500,
                    '&:hover': {
                        backgroundColor: canResend ? theme.palette.action.hover : 'transparent',
                    },
                })}
            >
                {isResending ? "Đang gửi..." : (canResend ? 'Gửi lại email' : `Gửi lại sau (${countdown}s)`)}
            </Button>

            <MuiLink component={RouterLink} to="/login" variant="body2" sx={{ mt: 3, fontWeight: 500, color: 'text.secondary' }}>
                Quay lại Đăng nhập
            </MuiLink>
        </Paper>
    );
};

const ForgotPasswordEmailSentPage = () => {
  return (
    <PublicPageLayout>
      <ForgotPasswordEmailSentPageContent />
    </PublicPageLayout>
  );
};
export default ForgotPasswordEmailSentPage;