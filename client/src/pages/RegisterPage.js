// client/src/pages/RegisterPage.js
import React from 'react';
// Imports cho nội dung cụ thể của trang này
import { Box, Typography, Link as MuiLink, Paper } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import RegisterForm from '../components/Auth/RegisterForm';
// Import Layout chung
import PublicPageLayout from '../components/layouts/PublicPageLayout';

// --- Component chứa nội dung CỤ THỂ của cột phải cho TRANG ĐĂNG KÝ ---
const RegisterPageSpecificContent = () => (
    // Box này để giới hạn chiều rộng và căn lề cho nội dung của form đăng ký
    <Box
        sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            width: '100%',
            maxWidth: 420,
        }}
    >
        <Typography component="h2" variant="h5" sx={{ fontWeight: 700, mb: 0.75, color: 'text.primary' }}>
            Đăng ký tài khoản
        </Typography>
        <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
            Bạn đã có tài khoản?{' '}
            <MuiLink component={RouterLink} to="/login" variant="body2" sx={{ fontWeight: 600, color: 'primary.main', textDecoration:'none' }}>
                Đăng nhập
            </MuiLink>
        </Typography>
        <RegisterForm /> {/* Component form đăng ký chi tiết */}
    </Box>
);

// --- Component Trang Đăng Ký Chính ---
const RegisterPage = () => {
  return (
    // Sử dụng Layout chung
    <PublicPageLayout>
      <Paper
        elevation={0} // Không có shadow nếu layout đã có nền
        square
        sx={{
          p: 0, // Bỏ padding ở đây nếu Box bên trong đã tự căn chỉnh
          pl: { xs: 2.5, sm: 6, md: 8, lg: 35 },
          backgroundColor: 'transparent', // Nền trong suốt để lấy nền từ PublicPageLayout
          width: '100%', // Chiếm toàn bộ không gian được cấp bởi Grid item của PublicPageLayout
          display: 'flex', // Để căn giữa RegisterPageSpecificContent
          justifyContent: 'center', // Căn giữa theo chiều ngang
          alignItems: 'center' // Căn giữa theo chiều dọc (nếu RegisterPageSpecificContent không chiếm toàn bộ chiều cao)
        }}
      >
        <RegisterPageSpecificContent />
      </Paper>
    </PublicPageLayout>
  );
};

export default RegisterPage;