// client/src/pages/TwoFactorAuthPage.js
import React, { useEffect } from 'react'; // <<<< Đảm bảo useEffect được import từ 'react'
import { Box, Typography, Paper, Container } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import TwoFactorAuthForm from '../components/Auth/TwoFactorAuthForm';
import PublicPageLayout from '../components/layouts/PublicPageLayout';

const TwoFactorAuthPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const emailFor2FA = location.state?.email;

  // Gọi useEffect ở cấp cao nhất
  useEffect(() => {
    // Logic kiểm tra và chuyển hướng nằm BÊN TRONG useEffect
    if (!emailFor2FA) {
      // Nếu không có email, chuyển hướng về trang đăng nhập
      console.log("TwoFactorAuthPage: No email found in location state, redirecting to login.");
      navigate('/login', { replace: true });
    }
  }, [emailFor2FA, navigate]); // Thêm emailFor2FA vào dependency array

  // Nếu emailFor2FA không tồn tại, không render phần còn lại của component
  // Việc chuyển hướng đã được xử lý trong useEffect
  if (!emailFor2FA) {
    return null; // Hoặc một component loading/thông báo lỗi nhỏ gọn
                 // nếu muốn hiển thị gì đó trước khi useEffect kịp chuyển hướng
  }

  const handleVerificationSuccess = () => {
    navigate('/profile/info', { replace: true });
  };

  return (
    <PublicPageLayout>
      <Container component="main" maxWidth="xs" sx={{ ml: 38, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper elevation={3} sx={{ padding: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
          <Typography component="h1" variant="h5" sx={{ mb: 1 }}>
            Xác Thực 2 lớp
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 3, textAlign: 'center' }}>
            Một mã OTP đã được gửi đến email <Box component="span" sx={{fontWeight: 'bold'}}>{emailFor2FA}</Box>. Vui lòng nhập mã để tiếp tục.
          </Typography>
          <TwoFactorAuthForm
            email={emailFor2FA}
            onSuccess={handleVerificationSuccess}
          />
        </Paper>
      </Container>
    </PublicPageLayout>
  );
};

export default TwoFactorAuthPage;