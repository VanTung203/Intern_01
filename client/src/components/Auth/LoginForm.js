// client/src/components/Auth/LoginForm.js
import React, { useState } from 'react';
import {
  TextField, Button, Box, Typography, Link as MuiLink,
  IconButton, InputAdornment, Alert, CircularProgress
} from '@mui/material'; // Bỏ Grid, Checkbox, FormControlLabel nếu không dùng
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { login } from '../../services/authService'; // Import hàm login

const LoginForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiMessage, setApiMessage] = useState(null); // { type: 'success' | 'error', text: string }
  // Không cần apiErrorDetails dạng mảng nếu lỗi login thường là một thông điệp chung

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
        const response = await login(formData); // Gọi API login
        // Giả sử backend trả về { token: "...", user: {...} }
        // authService.login đã lưu token và set header rồi
        setApiMessage({ type: 'success', text: "Đăng nhập thành công! Đang chuyển hướng..."}); // Thông báo tạm
        // TODO: Cập nhật trạng thái đăng nhập toàn cục (ví dụ: Context API, Redux)
        // Ví dụ: authContext.login(response.user, response.token);

        setTimeout(() => {
            navigate('/profile'); // Hoặc trang chính sau khi đăng nhập
        }, 1500);

      } catch (error) {
        if (error.response && error.response.data && error.response.data.message) {
            setApiMessage({ type: 'error', text: error.response.data.message });
        } else if (error.response && typeof error.response.data === 'string') {
            setApiMessage({ type: 'error', text: error.response.data });
        }
         else {
          setApiMessage({ type: 'error', text: error.message || 'Đăng nhập thất bại. Vui lòng thử lại.' });
        }
      } finally {
        setIsLoading(false);
      }
    }
  };


  // --- Tái sử dụng hàm renderFloatingLabelTextField từ RegisterForm.js ---
  // Hoặc có thể định nghĩa lại ở đây, hoặc import từ một file utils chung
  const renderFloatingLabelTextFieldInternal = ({
    name,
    labelText, // Sẽ là prop label của TextField nếu không dùng label nổi tùy chỉnh
    placeholder,
    type = 'text',
    autoComplete = name,
    isRequired = true,
    autoFocus = false,
    isPasswordType = false,
    showPasswordState,
    togglePasswordVisibility,
  }) => (
    <Box sx={{ position: 'relative', mb: 2 }}> {/* Giảm mb một chút */}
      {/* Nếu không dùng label nổi tùy chỉnh, bỏ Typography này */}
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
        // label={labelText + (isRequired ? ' *' : '')} // Dùng cách này nếu muốn label chuẩn của MUI
        required={isRequired} margin="none" fullWidth id={name} name={name}
        type={isPasswordType ? (showPasswordState ? 'text' : 'password') : type}
        autoComplete={autoComplete} placeholder={placeholder}
        value={formData[name]} onChange={handleChange}
        error={!!errors[name] && !apiMessage}
        helperText={!apiMessage ? errors[name] : ''}
        disabled={isLoading} size="small" autoFocus={autoFocus}
        InputProps={isPasswordType ? {
          endAdornment: ( <InputAdornment position="end"> <IconButton aria-label={`toggle ${name} visibility`} onClick={togglePasswordVisibility} onMouseDown={handleMouseDownPassword} edge="end" disabled={isLoading} size="small" sx={{ color: 'text.secondary', mr: -0.5 }}> {showPasswordState ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />} </IconButton> </InputAdornment> ),
        } : null}
        inputProps={{ style: { paddingTop: '10px', paddingBottom: '10px', fontSize: '0.9rem' } }}
      />
    </Box>
  );


  return (
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: '100%' }}>
      {apiMessage && (
        <Alert severity={apiMessage.type} sx={{ mb: 2 }} onClose={() => setApiMessage(null)}>
          {apiMessage.text}
        </Alert>
      )}

      {renderFloatingLabelTextFieldInternal({
        name: "email",
        labelText: "Email", // Label cho input
        placeholder: "Email", // Placeholder bên trong input
        autoComplete: "email",
        autoFocus: true,
        isRequired: true // Email thường là bắt buộc
      })}

      <Box sx={{ position: 'relative', mb: 2 }}>
        <Typography
            variant="caption" component="label" htmlFor="password"
            sx={{
            position: 'absolute', top: '-9px', left: '12px',
            backgroundColor: (theme) => theme.palette.background.paper,
            px: '5px', fontSize: '11.5px',
            color: errors.password && !apiMessage ? 'error.main' : 'text.secondary',
            fontWeight: 500, zIndex: 1,
            }}
        >
            Mật khẩu *
        </Typography>
        {/* Link Quên mật khẩu */}
        <MuiLink
            component={RouterLink}
            to="/forgot-password" // Route cho trang quên mật khẩu
            variant="caption" // Hoặc body2
            sx={{
                position: 'absolute',
                top: '-15px', // Căn chỉnh cho thẳng hàng với label "Mật khẩu"
                right: '12px', // Đặt ở bên phải
                zIndex: 1, // Đảm bảo nằm trên
                fontWeight: 500,
                color: 'primary.main',
                textDecoration: 'none',
                fontSize: '11.5px', // Giống kích thước label
            }}
            >
            Quên mật khẩu?
        </MuiLink>
        <TextField
            required margin="none" fullWidth name="password"
            type={showPassword ? 'text' : 'password'} id="password"
            autoComplete="current-password" placeholder="Mật khẩu"
            value={formData.password} onChange={handleChange}
            error={!!errors.password && !apiMessage}
            helperText={!apiMessage ? errors.password : ''}
            disabled={isLoading} size="small"
            InputProps={{
            endAdornment: ( <InputAdornment position="end"> <IconButton aria-label="toggle password visibility" onClick={handleClickShowPassword} onMouseDown={handleMouseDownPassword} edge="end" disabled={isLoading} size="small" sx={{ color: 'text.secondary', mr: -0.5 }}> {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />} </IconButton> </InputAdornment> ),
            }}
            inputProps={{ style: { paddingTop: '10px', paddingBottom: '10px', fontSize: '0.9rem' } }}
        />
      </Box>

      <Button
        type="submit"
        fullWidth
        variant="contained"
        disabled={isLoading}
        sx={{
          mt: 3, // Tăng margin top cho nút
          mb: 2,
          py: 1.1,
          backgroundColor: '#212B36', // Màu nút như mẫu
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