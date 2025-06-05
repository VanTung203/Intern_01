// client/src/pages/LoginPage.js
//import React from 'react';
import { Box, Typography, Link as MuiLink, Paper } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import LoginForm from '../components/Auth/LoginForm';
import PublicPageLayout from '../components/layouts/PublicPageLayout'; // SỬ DỤNG LẠI LAYOUT

// --- Component Nội dung Cụ thể cho Cột Phải của Trang Đăng Nhập ---
const LoginPageContent = () => (
    <Box
        sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            width: '100%',
            maxWidth: 350,
            // border: '1px solid red', // Bật lên để debug
        }}
    >
        <Typography component="h2" variant="h5" sx={{ fontWeight: 700, mb: 0.75, color: 'text.primary' }}>
            Đăng nhập
        </Typography>
        <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
            Chưa có tài khoản?{' '}
            <MuiLink component={RouterLink} to="/register" variant="body2" sx={{ fontWeight: 600, color: 'primary.main', textDecoration:'none' }}>
                Bắt đầu ngay bây giờ!
            </MuiLink>
        </Typography>
        <LoginForm />
    </Box>
);

const LoginPage = () => {
  return (
    <PublicPageLayout>
      {/* Truyền nội dung đăng nhập vào PublicPageLayout */}
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
          <LoginPageContent />
      </Paper>
    </PublicPageLayout>
  );
};

export default LoginPage;