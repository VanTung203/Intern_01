// client/src/layouts/PublicPageLayout.js
import React from 'react';
import { Box, Grid, Typography, Link as MuiLink, AppBar, Toolbar, Container } from '@mui/material';
// Không cần Paper ở đây vì trang con sẽ quyết định dùng Paper hay không
// import { Link as RouterLink } from 'react-router-dom'; // Chỉ cần nếu header có link điều hướng chung bằng RouterLink

// --- Component Logo với Text (Tái sử dụng) ---
// Có thể cân nhắc đưa component này ra một file riêng (ví dụ: src/components/common/AppLogo.js)
// nếu nó được sử dụng ở nhiều layout khác nhau.
const VietbandoLogoWithText = () => (
    <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => window.location.href = '/'}>
        <img
            src={`${process.env.PUBLIC_URL}/logo_Vietbando.png`} // Đảm bảo file này tồn tại
            alt="Vietbando Logo"
            style={{ height: '40px', marginRight: '5px' }} // Điều chỉnh style cho khớp
        />
        <Typography
            variant="h6"
            component="div"
            sx={{
                color: 'text.primary',
                fontWeight: 700,
                fontSize: '1rem', // Điều chỉnh kích thước chữ
                letterSpacing: '0px' // Điều chỉnh khoảng cách chữ nếu cần
            }}
        >
            vietbando
        </Typography>
    </Box>
);

// --- Component Ảnh Minh Họa (Tái sử dụng) ---
// Tương tự, có thể đưa ra file riêng (ví dụ: src/components/common/AuthIllustration.js)
const RegistrationIllustration = () => (
    <Box
        component="img"
        sx={{
            height: 'auto',
            width: '100%',
            maxWidth: { xs: '280px', sm: '320px', md: '380px'},
            display: 'block',
            mx: 'auto',
            mt: { xs: 3, sm: 6 }
        }}
        alt="Register Illustration"
        src={`${process.env.PUBLIC_URL}/image_register.png`}
    />
);

// --- Component Layout Chính ---
// Prop `children` sẽ là nội dung của cột bên phải (ví dụ: RegisterForm, hoặc nội dung của PleaseVerifyEmailPage)
const PublicPageLayout = ({ children }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', backgroundColor: 'background.default' }}>
      {/* AppBar (Header chung) */}
      <AppBar position="static" color="transparent" elevation={0} sx={{ borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}>
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ justifyContent: 'space-between', py: 1.25, minHeight: { xs: 56, sm: 64 } }}>
            <VietbandoLogoWithText />
            <MuiLink
              component="button" // Để có thể onClick
              variant="body2"
              onClick={() => alert('Cần trợ giúp? clicked!')} // Thay bằng hành động thực tế
              sx={{ textDecoration: 'none', color: 'text.secondary', fontWeight: 600, fontSize: '0.875rem' }}
            >
              Cần trợ giúp?
            </MuiLink>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Nội dung chính với 2 cột */}
      <Grid container component="main" sx={{ flexGrow: 1, overflow: 'hidden' }}>
        {/* Cột Trái - Phần Giới Thiệu (Luôn cố định trong layout này) */}
        <Grid
          item
          xs={false} // Ẩn trên màn hình rất nhỏ
          sm={6}   // Chiếm nửa màn hình từ sm
          md={7}   // Chiếm 7/12 từ md
          lg={7}
          sx={{
            display: { xs: 'none', sm: 'flex' }, // Chỉ hiển thị từ sm trở lên
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            p: { sm: 3, md: 6, lg: 8 },
            backgroundColor: '#F9FAFB', // Màu nền xám nhạt
          }}
        >
          <Box sx={{ maxWidth: 350, textAlign: 'center' }}> {/* Điều chỉnh maxWidth nếu cần */}
            <Typography component="h1" variant="h3" sx={{ fontWeight: 700, mb: 1.5, color: 'text.primary' }}>
              Vietbando, Xin Chào!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4, lineHeight: 1.6 }}>
              Nền tảng cung cấp bản quyền các phần mềm thuộc hệ thống Vietbando
            </Typography>
            <RegistrationIllustration />
          </Box>
        </Grid>

        {/* Cột Phải - Nội dung động được truyền qua prop 'children' */}
        <Grid
          item
          xs={12} // Chiếm toàn bộ trên xs (khi cột trái ẩn)
          sm={6}
          md={5}
          lg={5}
          // Không dùng component={Paper} ở đây nữa, để trang con tự quyết định
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',    // Căn giữa Box con chứa nội dung
            justifyContent: 'center', // Căn giữa Box con chứa nội dung
            p: { xs: 2.5, sm: 4, md: 5, lg: 6 }, // Padding chung cho cột phải
            // pl: { xs: 2.5, sm: 6, md: 8, lg: 40 },
            overflowY: 'auto', // Cho phép cuộn nếu nội dung con dài
            backgroundColor: 'background.paper' // Nền trắng cho cột này (hoặc bỏ nếu muốn nó trong suốt)
          }}
        >
          {/* Nội dung của trang cụ thể (RegisterForm, PleaseVerifyEmailPageContent) sẽ được render ở đây */}
          {children}
        </Grid>
      </Grid>
    </Box>
  );
};

export default PublicPageLayout;