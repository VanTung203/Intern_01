// client/src/pages/RegisterPage.js
import React from 'react';
import { Box, Grid, Paper, Typography, Link as MuiLink, Avatar } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'; // Hoặc một icon logo phù hợp
import RegisterForm from '../components/Auth/RegisterForm'; // Component form sẽ tạo/cập nhật
// import yourLogo from '../assets/your-logo.png'; // Thay thế bằng logo của bạn
// import illustrationImage from '../assets/register-illustration.svg'; // Thay thế bằng hình ảnh minh họa

const RegisterPage = () => {
  return (
    <Grid container component="main" sx={{ height: '100vh' }}>
      {/* Cột Trái - Phần Giới Thiệu */}
      <Grid
        item
        xs={12} // Trên màn hình nhỏ, cột này chiếm toàn bộ
        sm={6}  // Trên màn hình vừa trở lên, chiếm 1 nửa
        md={7}  // Có thể điều chỉnh tỉ lệ này
        sx={{
          // backgroundImage: `url(${illustrationImage})`, // Hình ảnh minh họa
          // backgroundRepeat: 'no-repeat',
          // backgroundColor: (t) =>
          //   t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
          // backgroundSize: 'cover',
          // backgroundPosition: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center', // Hoặc 'flex-start' nếu muốn text căn lề trái
          justifyContent: 'center',
          p: { xs: 2, sm: 4, md: 6 }, // Padding tùy theo kích thước màn hình
          // Phần này có thể tùy biến nhiều, ví dụ chỉ hiện trên màn hình lớn
          // display: { xs: 'none', sm: 'flex' } // Ẩn trên màn hình rất nhỏ
        }}
      >
        {/* <img src={yourLogo} alt="App Logo" style={{ width: '150px', marginBottom: '20px' }} /> */}
        <Typography component="h1" variant="h3" sx={{ fontWeight: 'bold', mb: 2, textAlign:'center' }}>
          IDENTITY APP, Xin Chào!
        </Typography>
        <Typography variant="h6" sx={{ color: 'text.secondary', textAlign:'center' }}>
          Nền tảng cung cấp giải pháp xác thực và quản lý tài khoản tập trung.
        </Typography>
        {/* Có thể thêm hình ảnh minh họa lớn ở đây nếu không dùng background */}
        <Box
            component="img"
            sx={{
              mt: 4,
              height: 'auto',
              width: '80%', // Điều chỉnh kích thước ảnh
              maxWidth: '400px', // Giới hạn kích thước tối đa
            }}
            // alt="Illustration"
            // src={illustrationImage} // Đường dẫn tới ảnh
        />
      </Grid>

      {/* Cột Phải - Form Đăng Ký */}
      <Grid item xs={12} sm={6} md={5} component={Paper} elevation={0} square
        sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center', // Căn giữa form theo chiều dọc
            p: { xs: 2, sm: 4, md: 6 }
        }}
      >
        <Box // Box này để chứa header nhỏ của cột phải nếu cần
            sx={{
                position: 'absolute',
                top: 24,
                right: 24,
                // display: { xs: 'none', sm: 'block'} // Ẩn trên màn hình nhỏ nếu muốn
            }}
        >
            <Typography variant="body2">
                Cần trợ giúp?
            </Typography>
        </Box>

        <Box
          sx={{
            my: 4, // my là margin top và bottom
            mx: 'auto', // mx auto để căn giữa theo chiều ngang
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center', // Căn giữa các item con (Avatar, Typography, Form)
            width: '100%', // Chiếm toàn bộ chiều rộng của Grid item cha
            maxWidth: '450px' // Giới hạn chiều rộng tối đa của form
          }}
        >
          {/* <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <LockOutlinedIcon />
          </Avatar> */}
          <Typography component="h1" variant="h5" sx={{ fontWeight: 'bold' }}>
            Đăng ký tài khoản
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, mb: 3 }}>
            Bạn đã có tài khoản?{' '}
            <MuiLink component={RouterLink} to="/login" variant="body2">
              Đăng nhập
            </MuiLink>
          </Typography>
          <RegisterForm /> {/* Component form sẽ nằm ở đây */}
        </Box>
      </Grid>
    </Grid>
  );
};

export default RegisterPage;