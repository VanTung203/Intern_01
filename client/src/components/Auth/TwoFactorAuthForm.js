// client/src/components/Auth/TwoFactorAuthForm.js
import React, { useState } from 'react';
import { TextField, Button, Box, Alert, CircularProgress } from '@mui/material';
import { verifyTwoFactorOtp } from '../../services/authService';
import { setGlobalAuthHeader } from '../../api/apiClient';

// (Ở đây có thể tái sử dụng hàm renderFloatingLabelTextField)
const renderFloatingLabelTextField = ({ name, labelText, ...props }) => (
  <TextField
    variant="outlined"
    margin="normal"
    required
    fullWidth
    id={name}
    label={labelText}
    name={name}
    {...props}
  />
);

const TwoFactorAuthForm = ({ email, onSuccess }) => {
  const [otpCode, setOtpCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (!otpCode || otpCode.length !== 6 || !/^\d{6}$/.test(otpCode)) {
      setError('Mã OTP phải là 6 chữ số.');
      return;
    }
    setIsLoading(true);
    try {
      const response = await verifyTwoFactorOtp(email, otpCode);
      if (response && response.token) {
        localStorage.setItem('authToken', response.token);
        setGlobalAuthHeader(response.token);
        onSuccess(); // Gọi callback khi thành công
      } else {
        // Trường hợp API trả về 200 OK nhưng không có token (ít xảy ra nếu backend đúng)
        setError(response.message || 'Xác thực thất bại. Vui lòng thử lại.');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Lỗi xác thực OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: '100%' }}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {renderFloatingLabelTextField({
        name: "otpCode",
        labelText: "Mã OTP (6 chữ số)",
        autoComplete: "one-time-code",
        autoFocus: true,
        value: otpCode,
        onChange: (e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6)),
        inputProps: { maxLength: 6, inputMode: "numeric" },
        error: !!error, // Để highlight nếu có lỗi chung
      })}
      <Button
        type="submit"
        fullWidth
        variant="contained"
        color="primary"
        disabled={isLoading}
        sx={{ mt: 3, mb: 2 }}
      >
        {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Xác Nhận'}
      </Button>
    </Box>
  );
};

export default TwoFactorAuthForm;