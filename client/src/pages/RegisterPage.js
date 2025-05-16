// client/src/pages/RegisterPage.js
import React from 'react';
import { Box, Grid, Paper, Typography, Link as MuiLink, AppBar, Toolbar, Container } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import RegisterForm from '../components/Auth/RegisterForm';

// --- Component Logo với Text ---
const VietbandoLogoWithText = () => (
    <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => window.location.href = '/'}> {/* Thêm onClick để về trang chủ nếu muốn */}
        <img
            src={`${process.env.PUBLIC_URL}/logo_Vietbando.png`}
            alt="Vietbando Logo"
            style={{ height: '40px', marginRight: '5px' }} // Điều chỉnh kích thước và khoảng cách
        />
        <Typography
            variant="h6" // Có thể dùng typography từ theme
            component="div"
            sx={{
                color: 'text.primary', // Lấy màu từ theme
                fontWeight: 700, // Hoặc theme.typography.fontWeightBold
                fontSize: '1rem', // Điều chỉnh kích thước chữ
                letterSpacing: '0px' // Điều chỉnh khoảng cách chữ nếu cần
            }}
        >
            vietbando
        </Typography>
    </Box>
);

// --- Component Ảnh Minh Họa ---
const RegistrationIllustration = () => (
    <Box
        component="img"
        sx={{
            height: 'auto',
            width: '100%',
            maxWidth: { xs: '280px', sm: '320px', md: '380px' },
            display: 'block',
            mx: 'auto',
            mt: { xs: 3, sm: 6 } // Thêm margin top
        }}
        alt="Register Illustration"
        src={`${process.env.PUBLIC_URL}/image_register.png`}
    />
);

const RegisterPage = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', backgroundColor: 'background.default' }}>
      <AppBar position="static" color="transparent" elevation={0} sx={{ borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}>
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ justifyContent: 'space-between', py: 1.25, minHeight: { xs: 56, sm: 64 } }}>
            <VietbandoLogoWithText />
            <MuiLink
              component="button"
              variant="body2"
              onClick={() => alert('Cần trợ giúp? clicked!')}
              sx={{ textDecoration: 'none', color: 'text.secondary', fontWeight: 500, fontSize: '0.875rem' }}
            >
              Cần trợ giúp?
            </MuiLink>
          </Toolbar>
        </Container>
      </AppBar>

      <Grid container component="main" sx={{ flexGrow: 1, overflow: 'hidden' }}>
        {/* Cột Trái */}
        <Grid
          item
          xs={false} // Ẩn hoàn toàn trên xs
          sm={6}   // Bắt đầu hiển thị từ sm
          md={7}   // Tỉ lệ cột
          lg={7}   // Giữ nguyên tỉ lệ cho màn hình lớn hơn
          sx={{
            display: { xs: 'none', sm: 'flex' },
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            p: { sm: 3, md: 6, lg: 8 }, // Điều chỉnh padding
            backgroundColor: '#F9FAFB', // Màu nền xám rất nhạt như mẫu
          }}
        >
          <Box sx={{ maxWidth: 350, textAlign: 'center' }}>
            <Typography component="h1" variant="h3" sx={{ fontWeight: 700, mb: 1.5, color: 'text.primary' }}>
              Vietbando, Xin Chào!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4, lineHeight: 1.6 }}> {/* Tăng line-height */}
              Nền tảng cung cấp bản quyền các phần mềm thuộc hệ thống Vietbando
            </Typography>
            <RegistrationIllustration />
          </Box>
        </Grid>

        {/* Cột Phải */}
        <Grid
          item
          xs={12}
          sm={6}
          md={5}
          lg={5}
          component={Paper}
          elevation={0}
          square
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            p: { xs: 2.5, sm: 4, md: 5, lg: 6 }, // Điều chỉnh padding
            pl: { xs: 2.5, sm: 6, md: 8, lg: 40 },
            overflowY: 'auto',
            backgroundColor: 'background.paper'
          }}
        >
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
            <RegisterForm />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RegisterPage;