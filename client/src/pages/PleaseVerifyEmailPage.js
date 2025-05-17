// client/src/pages/PleaseVerifyEmailPage.js
import React from 'react';
import { Box, Container, Typography, Paper, AppBar, Toolbar, Link as MuiLink } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'; // Icon cho thành công

// Giả sử bạn có component logo
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

const PleaseVerifyEmailPage = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'background.default' }}>
      <AppBar position="static" color="transparent" elevation={0} sx={{ borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}>
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ justifyContent: 'space-between', py: 1.25, minHeight: { xs: 56, sm: 64 } }}>
            <VietbandoLogoWithText />
            <MuiLink component={RouterLink} to="/login" variant="body2" sx={{ textDecoration: 'none', color: 'text.secondary', fontWeight: 500 }}>
              Đăng nhập
            </MuiLink>
          </Toolbar>
        </Container>
      </AppBar>

      <Container component="main" maxWidth="sm" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 4 }}>
        <Paper elevation={3} sx={{ p: {xs: 3, sm: 4}, display: 'flex', flexDirection: 'column', alignItems: 'center', borderRadius: 2 }}>
          <CheckCircleOutlineIcon sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
          <Typography component="h1" variant="h5" sx={{ fontWeight: 'bold', mb: 2, textAlign: 'center' }}>
            Đăng ký thành công!
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', mb: 3 }}>
            Chúng tôi đã gửi một email đến địa chỉ bạn đã đăng ký.
            Vui lòng kiểm tra hộp thư đến (và cả thư mục spam) để xác thực tài khoản của bạn.
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
            Nếu bạn không nhận được email, vui lòng thử lại sau hoặc liên hệ hỗ trợ.
          </Typography>
          {/* Có thể thêm nút "Gửi lại email xác thực" ở đây sau này */}
        </Paper>
      </Container>
    </Box>
  );
};

export default PleaseVerifyEmailPage;