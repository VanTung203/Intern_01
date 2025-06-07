// client/src/components/Auth/LoginForm.js
import React, { useState } from 'react';
import {
  TextField, Button, Box, Typography, Link as MuiLink,
  IconButton, InputAdornment, Alert, CircularProgress
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { login } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';

const LoginForm = () => {
  const navigate = useNavigate();
  const auth = useAuth(); // <-- LẤY CONTEXT
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiMessage, setApiMessage] = useState(null); // { type: 'success' | 'error' | 'info' | 'warning', text: string }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
    if (errors[name]) {
      setErrors(prevErrors => ({ ...prevErrors, [name]: '' }));
    }
    if (apiMessage) setApiMessage(null);
  };

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event) => event.preventDefault();

  const validate = () => {
    let tempErrors = {};
    if (!formData.email.trim()) tempErrors.email = "Địa chỉ email là bắt buộc.";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) tempErrors.email = "Địa chỉ email không hợp lệ.";
    if (!formData.password) tempErrors.password = "Mật khẩu là bắt buộc.";
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiMessage(null);
    if (validate()) {
        setIsLoading(true);
        try {
            const response = await login(formData); // response giờ là data từ API

            if (response.requiresTwoFactor) {
                // Xử lý 2FA như cũ
                setApiMessage({ type: 'info', text: response.message || "Yêu cầu xác thực 2 lớp..." });
                setTimeout(() => {
                    navigate('/verify-2fa', { state: { email: formData.email, message: response.message } });
                }, 1500);
            } else if (response.token && response.user) {
                // Đăng nhập thành công!
                setApiMessage({ type: 'success', text: response.message || "Đăng nhập thành công!" });
                // GỌI HÀM CỦA CONTEXT
                auth.loginAction(response); 
                
                // KHÔNG navigate ở đây nữa. App.js sẽ tự động điều hướng.
                // setTimeout(() => {
                //     navigate('/profile/info'); 
                // }, 1500); // <-- XÓA HOẶC COMMENT OUT KHỐI NÀY
            } else {
                setApiMessage({ type: 'error', text: response?.message || 'Lỗi không xác định.' });
            }
        } catch (error) {
            // ... (khối catch giữ nguyên logic hiển thị lỗi) ...
            if (error.response && error.response.data) {
                if (error.response.data.requireEmailConfirmation) {
                      setApiMessage({ type: 'warning', text: error.response.data.message || "Email chưa được xác thực." });
                } else {
                      setApiMessage({ type: 'error', text: error.response.data.message || 'Đăng nhập thất bại.' });
                }
            } else {
                setApiMessage({ type: 'error', text: 'Đăng nhập thất bại. Vui lòng thử lại.' });
            }
        } finally {
            setIsLoading(false);
          }
    }
  };

  // Hàm renderFloatingLabelTextFieldInternal
  const renderFloatingLabelTextFieldInternal = ({
    name,
    labelText,
    placeholder,
    type = 'text',
    autoComplete = name,
    isRequired = true,
    autoFocus = false,
    isPasswordType = false, // Thêm prop này để xác định đây có phải trường password không
    showPasswordState,      // Trạng thái show/hide password (nếu là trường password)
    togglePasswordVisibility // Hàm để toggle (nếu là trường password)
  }) => (
    <Box sx={{ position: 'relative', mb: 2 }}>
      <Typography
        variant="caption" component="label" htmlFor={name}
        sx={{
          position: 'absolute', top: '-9px', left: '12px',
          backgroundColor: (theme) => theme.palette.background.paper,
          px: '5px', fontSize: '11.5px',
          color: errors[name] && !apiMessage ? 'error.main' : 'text.secondary',
          fontWeight: 500, zIndex: 1,
        }}
      >
        {labelText} {isRequired && '*'}
      </Typography>
      <TextField
        required={isRequired}
        margin="none"
        fullWidth
        id={name}
        name={name}
        type={isPasswordType ? (showPasswordState ? 'text' : 'password') : type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={formData[name]} // Đảm bảo formData[name] được sử dụng
        onChange={handleChange}
        error={!!errors[name] && !apiMessage} // Chỉ hiển thị lỗi field nếu không có apiMessage
        helperText={!apiMessage ? errors[name] : ''} // Chỉ hiển thị helperText lỗi field nếu không có apiMessage
        disabled={isLoading}
        size="small"
        autoFocus={autoFocus}
        InputProps={isPasswordType ? { // Chỉ thêm InputProps cho trường password
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label={`toggle ${name} visibility`}
                onClick={togglePasswordVisibility}
                onMouseDown={handleMouseDownPassword}
                edge="end"
                disabled={isLoading}
                size="small"
                sx={{ color: 'text.secondary', mr: -0.5 }}
              >
                {showPasswordState ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
              </IconButton>
            </InputAdornment>
          ),
        } : null}
        inputProps={{ style: { paddingTop: '10px', paddingBottom: '10px', fontSize: '0.9rem' } }}
      />
    </Box>
  );

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: '100%' }}>
      {apiMessage && (
        <Alert
          severity={apiMessage.type || 'info'} // Mặc định là 'info' nếu type không được set
          sx={{ mb: 2 }}
          onClose={() => setApiMessage(null)} // Cho phép đóng thông báo
        >
          {apiMessage.text}
        </Alert>
      )}

      {renderFloatingLabelTextFieldInternal({
        name: "email",
        labelText: "Email",
        placeholder: "Email",
        autoComplete: "email",
        autoFocus: true,
        isRequired: true
      })}

      <Box sx={{ textAlign: 'right', mt: -1.5, mb: 1.5 }}> {/* Điều chỉnh margin nếu cần */}
        <MuiLink
            component={RouterLink}
            to="/forgot-password"
            variant="caption"
            sx={{
                fontWeight: 500,
                color: 'text.primary',
                textDecoration: 'none',
                fontSize: '0.75rem', // Hoặc kích thước phù hợp
            }}
            >
            Quên mật khẩu?
        </MuiLink>
      </Box>

      {/* Sử dụng renderFloatingLabelTextFieldInternal cho trường password để nhất quán */}
      {renderFloatingLabelTextFieldInternal({
        name: "password",
        labelText: "Mật khẩu",
        placeholder: "Mật khẩu",
        autoComplete: "current-password",
        isRequired: true,
        isPasswordType: true, // Đánh dấu đây là trường password
        showPasswordState: showPassword,
        togglePasswordVisibility: handleClickShowPassword
      })}


      <Button
        type="submit"
        fullWidth
        variant="contained"
        disabled={isLoading}
        sx={{
          mt: 3,
          mb: 2,
          py: 1.1,
          backgroundColor: '#212B36',
          color: 'common.white',
          fontWeight: 600,
          '&:hover': {
            backgroundColor: '#161C24',
          },
          textTransform: 'none',
          fontSize: '0.9375rem',
          boxShadow: 'none',
          borderRadius: '8px'
        }}
        startIcon={isLoading ? <CircularProgress size={18} color="inherit" /> : null}
      >
        {isLoading ? 'Đang xử lý...' : 'Đăng nhập'}
      </Button>
    </Box>
  );
};

export default LoginForm;