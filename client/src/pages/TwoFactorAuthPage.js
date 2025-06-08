// client/src/pages/TwoFactorAuthPage.js
import React, { useEffect } from 'react';
import { Box, Typography, Paper, Container } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import TwoFactorAuthForm from '../components/Auth/TwoFactorAuthForm';
import PublicPageLayout from '../components/layouts/PublicPageLayout';

const TwoFactorAuthPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const emailFor2FA = location.state?.email;

  useEffect(() => {
    if (!emailFor2FA) {
      navigate('/login', { replace: true });
    }
  }, [emailFor2FA, navigate]);

  if (!emailFor2FA) {
    return null; 
  }

  // Xóa hàm handleVerificationSuccess vì không cần nữa
  // const handleVerificationSuccess = () => {
  //   navigate('/profile/info', { replace: true });
  // };

  return (
    <PublicPageLayout>
      <Container component="main" maxWidth="xs" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper elevation={3} sx={{ padding: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
          <Typography component="h1" variant="h5" sx={{ mb: 1 }}>
            Xác Thực 2 lớp
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 3, textAlign: 'center' }}>
            Một mã OTP đã được gửi đến email <Box component="span" sx={{fontWeight: 'bold'}}>{emailFor2FA}</Box>. Vui lòng nhập mã để tiếp tục.
          </Typography>
          
          {/* Xóa prop onSuccess */}
          <TwoFactorAuthForm email={emailFor2FA} />

        </Paper>
      </Container>
    </PublicPageLayout>
  );
};

export default TwoFactorAuthPage;