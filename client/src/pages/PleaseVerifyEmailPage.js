// client/src/pages/PleaseVerifyEmailPage.js
import React from 'react';
import { Box, Typography, Paper, Button, Link as MuiLink } from '@mui/material'; // Bỏ Container, AppBar, Toolbar
import { Link as RouterLink, useLocation } from 'react-router-dom';
// import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'; // Không cần icon này nữa, dùng icon khác
import MailOutlineIcon from '@mui/icons-material/MailOutline'; // Icon phù hợp hơn
import LoopIcon from '@mui/icons-material/Loop';
import PublicPageLayout from '../components/layouts/PublicPageLayout'; // IMPORT LAYOUT MỚI

// Bỏ component VietbandoLogoWithText ở đây vì nó đã có trong PublicPageLayout

const PleaseVerifyEmailPageContent = () => {
    const location = useLocation();
    const email = location.state?.email; // Lấy email được truyền từ trang đăng ký

    const handleResendEmail = async () => {
        if (!email) {
            alert("Không tìm thấy địa chỉ email để gửi lại.");
            return;
        }
        alert(`Đang gửi lại email xác thực đến ${email} (Chức năng này cần được implement)`);
        // TODO: Implement API call to resend verification email
        // try {
        //   await resendVerificationEmailService(email);
        //   alert('Email xác thực đã được gửi lại!');
        // } catch (error) {
        //   alert('Không thể gửi lại email. Vui lòng thử lại sau.');
        // }
    };

    return (
        // Nội dung cho cột bên phải
        <Paper
            elevation={0} // Bỏ shadow nếu PublicPageLayout đã có nền
            square
            sx={{
                pl: { xs: 2.5, sm: 6, md: 8, lg: 30 },
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                backgroundColor: 'transparent', // Để lấy nền từ PublicPageLayout
                width: '100%', // Chiếm toàn bộ không gian được cấp
                maxWidth: 750,  // Giới hạn chiều rộng nội dung
            }}
        >
            {/* Sử dụng hình ảnh hộp thư*/}
            <img
                src={`${process.env.PUBLIC_URL}/verify_email.png`}
                alt="Email Sent"
                style={{ width: '100px', height: '100px', marginBottom: '24px' }}
            />
            <Typography component="h1" variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                Xác minh email của bạn
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Vui lòng kiểm tra email đến của bạn để tìm liên kết xác minh địa chỉ email.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Sau khi hoàn thiện bạn có thể tiến hành đăng nhập.
            </Typography>
            {email && (
                <Typography variant="body1" color="text.primary" sx={{ fontWeight: 'bold', mb: 2.5 }}>
                    {email}
                </Typography>
            )}
            <Button
                variant="outlined" // Giữ variant="outlined" để có viền
                startIcon={<LoopIcon sx={{ fontSize: '1.0rem', mr: 0.5 }} />} // Điều chỉnh icon một chút cho cân đối
                onClick={handleResendEmail} // Giả sử hàm này đã được định nghĩa
                // disabled={!canResend || isLoading} // có thể thêm logic disabled ở đây nếu cần
                sx={(theme) => ({ // Truy cập theme để lấy màu xám
                    textTransform: 'none',
                    color: theme.palette.text.secondary, // Màu chữ xám (có thể là GREY[600])
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    borderColor: theme.palette.grey[400], // << VIỀN MÀU XÁM NHẠT (ví dụ GREY[400])
                                                        // Hoặc alpha(theme.palette.grey[500], 0.5) để mờ hơn
                    '&:hover': {
                        backgroundColor: theme.palette.action.hover, // Nền rất nhạt khi hover
                        borderColor: theme.palette.grey[500], // Viền đậm hơn chút khi hover (tùy chọn)
                    },
                    // Thêm padding nếu muốn nút có vẻ to hơn một chút, ví dụ:
                    // padding: '5px 12px',
                })}
            >
                Gửi lại (60s) {/* Thay bằng state countdown thực tế */}
            </Button>
        </Paper>
    );
};

const PleaseVerifyEmailPage = () => {
  return (
    <PublicPageLayout>
      <PleaseVerifyEmailPageContent />
    </PublicPageLayout>
  );
};

export default PleaseVerifyEmailPage;