// client/src/pages/EmailConfirmedPage.js
import React from 'react';
import { Box, Container, Typography, Paper, Button, AppBar, Toolbar, Link as MuiLink } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom'; // Giữ lại để tạo link
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

// Component Logo (giữ nguyên hoặc import từ file chung)
const VietbandoLogoWithText = () => (
    <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => window.location.href = '/'}>
        <img
            src={`${process.env.PUBLIC_URL}/logo_Vietbando.png`}
            alt="Vietbando Logo"
            style={{ height: '30px', marginRight: '10px' }}
        />
        <Typography variant="h6" component="div" sx={{ color: 'text.primary', fontWeight: 700, fontSize: '1.3rem' }}>
            vietbando
        </Typography>
    </Box>
);

const EmailConfirmedPage = () => {
  // Không cần logic useEffect hay gọi API ở đây nữa vì backend đã xử lý xác thực
  // và redirect trình duyệt đến trang này.

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'background.default' }}>
        <AppBar position="static" color="transparent" elevation={0} sx={{ borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}>
            <Container maxWidth="lg">
            <Toolbar disableGutters sx={{ justifyContent: 'space-between', py: 1.25, minHeight: { xs: 56, sm: 64 } }}>
                <VietbandoLogoWithText />
                {/* Nút Đăng nhập ở AppBar */}
                <Button component={RouterLink} to="/login" color="primary" variant="outlined" size="small">
                    Đăng nhập
                </Button>
            </Toolbar>
            </Container>
        </AppBar>
        <Container component="main" maxWidth="sm" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Paper elevation={3} sx={{ p: {xs:3, sm:4}, display: 'flex', flexDirection: 'column', alignItems: 'center', borderRadius: 2, textAlign: 'center', minWidth: 300 }}>
                <CheckCircleOutlineIcon sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
                <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold', mb: 2 }}>
                    Xác thực thành công!
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{mb: 3}}>
                    Email của bạn đã được xác thực. Bạn có thể đăng nhập ngay bây giờ.
                </Typography>
                <Button component={RouterLink} to="/login" variant="contained" sx={{ mt: 2 }}>
                    Đi đến Đăng nhập
                </Button>
            </Paper>
        </Container>
    </Box>
  );
};

export default EmailConfirmedPage;