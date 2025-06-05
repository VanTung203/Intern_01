// client/src/pages/EmailConfirmedPage.js
import React from 'react'; // Bỏ useEffect, useState, useSearchParams, useNavigate
import { Box, Typography, Paper, Button, Link as MuiLink } from '@mui/material'; // Bỏ Container, AppBar, Toolbar
import { Link as RouterLink } from 'react-router-dom';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PublicPageLayout from '../components/layouts/PublicPageLayout'; // IMPORT LAYOUT MỚI

// Bỏ VietbandoLogoWithText ở đây vì nó đã có trong PublicPageLayout

const EmailConfirmedPageContent = () => (
    // Nội dung cho cột bên phải
    <Paper
        elevation={0}
        square
        sx={{
            p: { xs: 3, sm: 4, md: 5 }, // Padding chung cho Paper
            pl: { xs: 2.5, sm: 6, md: 8, lg: 20 },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            backgroundColor: 'transparent',
            width: '100%',
            maxWidth: 600,
        }}
    >
        <CheckCircleOutlineIcon sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
        <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold', mb: 2 }}>
            Xác thực thành công!
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Email của bạn đã được xác thực thành công. Bạn có thể đăng nhập ngay bây giờ.
        </Typography>
        <Button component={RouterLink} to="/login" variant="contained" sx={{ mt: 2 }}>
            Đi đến Đăng nhập
        </Button>
    </Paper>
);

const EmailConfirmedPage = () => {
  // Không cần logic useEffect hay gọi API ở đây nữa nếu backend redirect đến đây SAU KHI đã xử lý xác thực
  return (
    <PublicPageLayout>
      <EmailConfirmedPageContent />
    </PublicPageLayout>
  );
};

export default EmailConfirmedPage;