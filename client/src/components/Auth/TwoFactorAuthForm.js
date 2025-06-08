// client/src/components/Auth/TwoFactorAuthForm.js
import React, { useState } from 'react';
import { TextField, Button, Box, Alert, CircularProgress } from '@mui/material';
import { verifyTwoFactorOtp } from '../../services/authService';
import { useAuth } from '../../context/AuthContext'; // <-- BƯỚC 1: IMPORT useAuth

// Bỏ prop 'onSuccess' vì không cần nữa
const TwoFactorAuthForm = ({ email }) => { 
  const [otpCode, setOtpCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const auth = useAuth(); // <-- BƯỚC 2: LẤY CONTEXT

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (!otpCode || otpCode.length !== 6 || !/^\d{6}$/.test(otpCode)) {
      setError('Mã OTP phải là 6 chữ số.');
      return;
    }
    setIsLoading(true);
    try {
      // Gọi API như cũ
      const response = await verifyTwoFactorOtp(email, otpCode);

      // BƯỚC 3: SỬA LẠI LOGIC SAU KHI THÀNH CÔNG
      if (response && response.token && response.user) {
        // Thay vì gọi onSuccess, chúng ta gọi thẳng loginAction của context
        auth.loginAction(response);
        // AuthContext sẽ tự động xử lý việc lưu token và điều hướng
      } else {
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
      <TextField
        variant="outlined"
        margin="normal"
        required
        fullWidth
        id="otpCode"
        label="Mã OTP (6 chữ số)"
        name="otpCode"
        autoComplete="one-time-code"
        autoFocus
        value={otpCode}
        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
        inputProps={{ maxLength: 6, inputMode: "numeric" }}
        error={!!error}
        helperText={error}
        disabled={isLoading}
      />
      <Button
        type="submit"
        fullWidth
        variant="contained"
        color="primary"
        disabled={isLoading}
        sx={{ mt: 3, mb: 2, py: 1.1 }}
      >
        {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Xác Nhận'}
      </Button>
    </Box>
  );
};

export default TwoFactorAuthForm;