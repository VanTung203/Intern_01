// client/src/pages/ResetPasswordPage.js
import React from 'react';
import { Box, Typography, Link as MuiLink, Paper } from '@mui/material';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import ResetPasswordForm from '../components/Auth/ResetPasswordForm'; // Form mới
import PublicPageLayout from '../components/layouts/PublicPageLayout';

const ResetPasswordPageContent = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const emailToReset = location.state?.emailToReset;

    React.useEffect(() => {
        if (!emailToReset) {
            console.warn("ResetPasswordPage: Email không được cung cấp qua state. Chuyển hướng về /forgot-password.");
            navigate('/forgot-password', { replace: true });
        }
    }, [emailToReset, navigate]);

    if (!emailToReset) {
        // Có thể hiển thị một loading indicator hoặc null trong khi chờ redirect
        return <Typography color="error" sx={{textAlign: 'center', mt:3}}>Thông tin không hợp lệ. Đang chuyển hướng...</Typography>;
    }

    return (
        <Box sx={{ width: '100%', maxWidth: 400, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <Typography component="h1" variant="h5" sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}>
                Đặt lại mật khẩu mới
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                Cho tài khoản: <strong style={{color: 'black'}}>{emailToReset}</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Vui lòng nhập mã token bạn nhận được qua email và mật khẩu mới của bạn.
            </Typography>
            <ResetPasswordForm emailToReset={emailToReset} /> {/* Truyền email vào form */}
            <Typography variant="body2" sx={{ mt: 3, textAlign: 'center', width: '100%' }}>
                <MuiLink component={RouterLink} to="/login" sx={{ fontWeight: 500, color: 'text.secondary', textDecoration:'none', '&:hover': {textDecoration: 'underline'} }}>
                    Quay lại Đăng nhập
                </MuiLink>
            </Typography>
        </Box>
    );
};

const ResetPasswordPage = () => {
  return (
    <PublicPageLayout>
        <Paper 
            elevation={0} 
            square 
            sx={{
                p:0,
                pl: { xs: 2.5, sm: 6, md: 8, lg: 20 },
                backgroundColor: 'transparent', 
                width: '100%', 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center' 
            }}
        >
        <ResetPasswordPageContent />
      </Paper>
    </PublicPageLayout>
  );
};
export default ResetPasswordPage;