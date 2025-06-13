// client/src/pages/ResetPasswordSuccessPage.js
import React from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PublicPageLayout from '../components/layouts/PublicPageLayout';

// Component Logo (nếu muốn có logo riêng ở đây, nhưng PublicPageLayout đã có)
// const VietbandoLogoWithText = () => ( /* ... */ );

const ResetPasswordSuccessPageContent = () => {
    const location = useLocation();
    // Lấy message từ state nếu có, hoặc dùng message mặc định
    const messageFromServer = location.state?.message || "Mật khẩu của bạn đã được cập nhật thành công!";

    return (
        <Paper
            elevation={0}
            square
            sx={{
                pl: { xs: 2.5, sm: 6, md: 8, lg: 20 },
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                backgroundColor: 'transparent',
                width: '100%',
                maxWidth: 500
            }}
        >
            <CheckCircleOutlineIcon sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
            <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold', mb: 2 }}>
                Đặt lại mật khẩu thành công!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                {messageFromServer} 
                {/* <br/> có thể đăng nhập ngay bây giờ. */}
            </Typography>
            <Button component={RouterLink} to="/login" variant="contained" color="primary" sx={{ mt: 2 }}>
                Đi đến Đăng nhập
            </Button>
        </Paper>
    );
};

const ResetPasswordSuccessPage = () => {
  return (
    <PublicPageLayout>
      <ResetPasswordSuccessPageContent />
    </PublicPageLayout>
  );
};
export default ResetPasswordSuccessPage;