// client/src/components/User/UserSecurityContent.js
import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Switch, FormControlLabel, CircularProgress, Alert, List, ListItem, ListItemText } from '@mui/material';
import ChangePasswordForm from '../Auth/ChangePasswordForm';
import { getUserProfile } from '../../services/userService'; // Để lấy trạng thái 2FA hiện tại
import { enableTwoFactor, disableTwoFactor } from '../../services/userService';

const UserSecurityContent = () => {
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isUpdating2FA, setIsUpdating2FA] = useState(false);
  const [twoFAError, setTwoFAError] = useState('');
  const [twoFAMessage, setTwoFAMessage] = useState('');
  // const [recoveryCodes, setRecoveryCodes] = useState([]); // Nếu muốn hiển thị mã khôi phục

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoadingProfile(true);
      try {
        const profile = await getUserProfile();
        setIs2FAEnabled(profile.twoFactorEnabled || false);
      } catch (error) {
        console.error("Failed to fetch user profile for 2FA status", error);
        setTwoFAError("Không thể tải trạng thái xác thực 2 lớp.");
      } finally {
        setIsLoadingProfile(false);
      }
    };
    fetchProfile();
  }, []);

  const handleToggle2FA = async () => {
    setIsUpdating2FA(true);
    setTwoFAError('');
    setTwoFAMessage('');
    // setRecoveryCodes([]);
    try {
      let response;
      if (is2FAEnabled) { // Nếu đang bật -> thực hiện tắt
        response = await disableTwoFactor();
        setIs2FAEnabled(false);
      } else { // Nếu đang tắt -> thực hiện bật
        response = await enableTwoFactor();
        setIs2FAEnabled(true);
        // if (response.recoveryCodes) {
        //   setRecoveryCodes(response.recoveryCodes);
        // }
      }
      setTwoFAMessage(response.message || (is2FAEnabled ? "Xác thực 2 lớp đã được bật." : "Xác thực 2 lớp đã được tắt."));
    } catch (error) {
      setTwoFAError(error.response?.data?.message || error.message || "Lỗi khi thay đổi trạng thái 2FA.");
      // Nếu lỗi, đảo ngược lại trạng thái switch (nếu cần)
      // setIs2FAEnabled(!is2FAEnabled); // Cẩn thận với logic này
    } finally {
      setIsUpdating2FA(false);
    }
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2.5 }}>
        Đổi mật khẩu
      </Typography>
      <ChangePasswordForm />

      <Box sx={{ mt: 4, borderTop: '1px solid', borderColor: 'divider', pt: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1.5 }}>
          Xác Thực 2 lớp (2FA)
        </Typography>
        {isLoadingProfile ? (
          <CircularProgress size={24} />
        ) : (
          <>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              Bảo vệ tài khoản của bạn bằng một lớp bảo mật bổ sung. 
              Khi được bật, bạn sẽ cần cung cấp mã OTP được gửi đến email của mình mỗi khi đăng nhập.
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={is2FAEnabled}
                  onChange={handleToggle2FA}
                  disabled={isUpdating2FA}
                  color="primary"
                />
              }
              label={is2FAEnabled ? "Xác thực 2 lớp đang BẬT" : "Xác thực 2 lớp đang TẮT"}
            />
            {isUpdating2FA && <CircularProgress size={20} sx={{ ml: 2 }} />}
            {twoFAError && <Alert severity="error" sx={{ mt: 2 }}>{twoFAError}</Alert>}
            {twoFAMessage && <Alert severity="success" sx={{ mt: 2 }}>{twoFAMessage}</Alert>}
            {/* {is2FAEnabled && recoveryCodes && recoveryCodes.length > 0 && (
              <Box sx={{mt: 2}}>
                <Typography variant="subtitle1" color="warning.main">
                  Quan trọng: Lưu lại các mã khôi phục này ở nơi an toàn.
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Nếu bạn mất quyền truy cập vào phương thức xác thực 2 lớp, bạn có thể sử dụng một trong các mã này để đăng nhập. Mỗi mã chỉ có thể sử dụng một lần.
                </Typography>
                <List dense>
                  {recoveryCodes.map((code, index) => (
                    <ListItem key={index} disablePadding>
                      <ListItemText primary={code} sx={{ fontFamily: 'monospace' }} />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )} */}
          </>
        )}
      </Box>
    </Box>
  );
};

export default UserSecurityContent;