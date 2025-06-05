// client/src/pages/ForgotPasswordPage.js
import React from 'react';
import { Box, Typography, Link as MuiLink, Paper } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ForgotPasswordForm from '../components/Auth/ForgotPasswordForm';
import PublicPageLayout from '../components/layouts/PublicPageLayout'; // Đảm bảo đường dẫn đúng

const ForgotPasswordPageContent = () => (
    <Box sx={{ 
        width: '100%', 
        maxWidth: 380, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'flex-start' 
        }}
    >
        <Typography component="h1" variant="h5" sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}>
            Quên mật khẩu?
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Nhập địa chỉ email liên kết với tài khoản của bạn và chúng tôi sẽ gửi cho bạn một mã token để đặt lại mật khẩu.
        </Typography>
        <ForgotPasswordForm />
        <Typography variant="body2" sx={{ mt: 3, textAlign: 'center', width: '100%' }}>
            <MuiLink component={RouterLink} to="/login" sx={{ fontWeight: 500, color: 'text.secondary', textDecoration:'none', '&:hover': {textDecoration: 'underline'} }}>
                Quay lại Đăng nhập
            </MuiLink>
        </Typography>
    </Box>
);

const ForgotPasswordPage = () => {
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
        <ForgotPasswordPageContent />
      </Paper>
    </PublicPageLayout>
  );
};
export default ForgotPasswordPage;