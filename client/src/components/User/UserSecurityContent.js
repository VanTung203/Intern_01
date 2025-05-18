// client/src/components/User/UserSecurityContent.js
import React from 'react';
import { Box, Typography, Divider } from '@mui/material';
import ChangePasswordForm from '../Auth/ChangePasswordForm'; // Import form đổi mật khẩu

const UserSecurityContent = () => {
  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2.5 }}>
        Đổi mật khẩu
      </Typography>
      <ChangePasswordForm />

      {/* Phần 2FA sẽ được thêm vào đây sau */}
      {/*
      <Divider sx={{ my: 4 }} />
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
        Xác thực hai yếu tố (2FA)
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Tăng cường bảo mật cho tài khoản của bạn bằng cách bật xác thực hai yếu tố.
      </Typography>
      // ... UI và logic cho 2FA ...
      */}
    </Box>
  );
};

export default UserSecurityContent;