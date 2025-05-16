// client/src/components/Auth/RegisterForm.js
import React, { useState } from 'react';
import {
  TextField, Button, Box, Typography, Checkbox, FormControlLabel,
  Link as MuiLink, Grid, IconButton, InputAdornment, Alert, CircularProgress
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { register } from '../../services/authService'; // << Bỏ comment dòng này và đảm bảo file này đúng

const RegisterForm = () => {
  const navigate = useNavigate(); // Để điều hướng sau khi đăng ký thành công (tùy chọn)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreedToTerms: false,
  });
  const [errors, setErrors] = useState({}); // Lỗi validation từ client-side
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiMessage, setApiMessage] = useState(null); // { type: 'success' | 'error', text: string }
  const [apiErrorDetails, setApiErrorDetails] = useState([]); // Mảng các string lỗi chi tiết từ API

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Xóa lỗi validation của trường đang được sửa
    if (errors[name]) {
      setErrors(prevErrors => ({ ...prevErrors, [name]: '' }));
    }
    // Xóa thông báo API cũ khi người dùng bắt đầu sửa form
    if (apiMessage) setApiMessage(null);
    if (apiErrorDetails.length > 0) setApiErrorDetails([]);
  };

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleClickShowConfirmPassword = () => setShowConfirmPassword((show) => !show);
  const handleMouseDownPassword = (event) => event.preventDefault();

  const validate = () => {
    let tempErrors = {};
    if (!formData.lastName.trim()) tempErrors.lastName = "Họ và tên đệm là bắt buộc.";
    if (!formData.firstName.trim()) tempErrors.firstName = "Tên là bắt buộc.";
    if (!formData.email.trim()) tempErrors.email = "Địa chỉ email là bắt buộc.";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) tempErrors.email = "Địa chỉ email không hợp lệ.";
    if (!formData.password) tempErrors.password = "Mật khẩu là bắt buộc.";
    else if (formData.password.length < 6) tempErrors.password = "Mật khẩu phải có ít nhất 6 ký tự.";
    if (!formData.confirmPassword) tempErrors.confirmPassword = "Xác nhận mật khẩu là bắt buộc.";
    else if (formData.password !== formData.confirmPassword) tempErrors.confirmPassword = "Mật khẩu không khớp.";
    if (!formData.agreedToTerms) tempErrors.agreedToTerms = "Bạn phải đồng ý với điều khoản dịch vụ.";
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiMessage(null); // Reset thông báo API cũ trước mỗi lần submit
    setApiErrorDetails([]);

    if (validate()) {
      setIsLoading(true);
      try {
        const payload = {
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
        };

        const response = await register(payload); // Gọi API thật từ authService

        // Backend trả về { message: "..." } khi thành công
        setApiMessage({ type: 'success', text: response.message || "Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản." });
        // Reset form và lỗi client-side
        setFormData({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '', agreedToTerms: false });
        setErrors({});
        // Tùy chọn: Chuyển hướng sau một khoảng thời gian
        // setTimeout(() => navigate('/login'), 3000);
      } catch (error) {
        if (error.response && error.response.data) {
            const errorData = error.response.data;
            if (errorData.errors && Array.isArray(errorData.errors)) {
                // Lỗi từ IdentityResult.Errors (mảng các object {code, description})
                setApiErrorDetails(errorData.errors.map(err => err.description || err.code));
                setApiMessage({ type: 'error', text: errorData.title || 'Đăng ký thất bại. Vui lòng kiểm tra các lỗi.' });
            } else if (errorData.message) {
                // Lỗi dạng message đơn giản từ backend (ví dụ: Unauthorized)
                setApiMessage({ type: 'error', text: errorData.message });
            } else if (typeof errorData === 'string') {
                // Nếu backend trả về một chuỗi lỗi đơn giản
                 setApiMessage({ type: 'error', text: errorData });
            }
             else {
                // Lỗi không có cấu trúc rõ ràng từ backend
                setApiMessage({ type: 'error', text: 'Đã có lỗi không mong muốn từ máy chủ.' });
            }
        } else {
          // Lỗi mạng hoặc lỗi không xác định khác
          setApiMessage({ type: 'error', text: error.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.' });
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: '100%' }}>
      {/* Hiển thị thông báo API */}
      {apiMessage && (
        <Alert severity={apiMessage.type} sx={{ mb: 2 }} onClose={() => { setApiMessage(null); setApiErrorDetails([]); }}>
          {apiMessage.text}
          {apiErrorDetails.length > 0 && (
            <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
              {apiErrorDetails.map((detail, index) => (
                <li key={index}>
                  <Typography variant="caption" display="block">
                    {detail}
                  </Typography>
                </li>
              ))}
            </ul>
          )}
        </Alert>
      )}

      <Grid container spacing={2} sx={{ mb: 1 }}>
        <Grid item xs={12} sm={6}>
          <TextField
            margin="none"
            required
            fullWidth
            id="lastName"
            label="Họ và tên đệm"
            name="lastName"
            autoComplete="family-name"
            value={formData.lastName}
            onChange={handleChange}
            error={!!errors.lastName && !apiMessage} // Chỉ hiển thị lỗi client nếu không có lỗi API
            helperText={!apiMessage ? errors.lastName : ''}
            disabled={isLoading}
            autoFocus // Trường đầu tiên
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            margin="none"
            required
            fullWidth
            id="firstName"
            label="Tên"
            name="firstName"
            autoComplete="given-name"
            value={formData.firstName}
            onChange={handleChange}
            error={!!errors.firstName && !apiMessage}
            helperText={!apiMessage ? errors.firstName : ''}
            disabled={isLoading}
          />
        </Grid>
      </Grid>
      <TextField
        margin="normal"
        required
        fullWidth
        id="email"
        label="Địa chỉ email"
        name="email"
        autoComplete="email"
        value={formData.email}
        onChange={handleChange}
        error={!!errors.email && !apiMessage}
        helperText={!apiMessage ? errors.email : ''}
        disabled={isLoading}
      />
      <TextField
        margin="normal"
        required
        fullWidth
        name="password"
        label="Mật khẩu"
        type={showPassword ? 'text' : 'password'}
        id="password"
        autoComplete="new-password"
        value={formData.password}
        onChange={handleChange}
        error={!!errors.password && !apiMessage}
        helperText={!apiMessage ? (errors.password || "Tối thiểu 6+ ký tự") : ''}
        disabled={isLoading}
        InputProps={{
          endAdornment: ( <InputAdornment position="end"> <IconButton aria-label="toggle password visibility" onClick={handleClickShowPassword} onMouseDown={handleMouseDownPassword} edge="end" disabled={isLoading} > {showPassword ? <VisibilityOff /> : <Visibility />} </IconButton> </InputAdornment> ),
        }}
      />
      <TextField
        margin="normal"
        required
        fullWidth
        name="confirmPassword"
        label="Xác nhận mật khẩu"
        type={showConfirmPassword ? 'text' : 'password'}
        id="confirmPassword"
        autoComplete="new-password"
        value={formData.confirmPassword}
        onChange={handleChange}
        error={!!errors.confirmPassword && !apiMessage}
        helperText={!apiMessage ? errors.confirmPassword : ''}
        disabled={isLoading}
        InputProps={{
          endAdornment: ( <InputAdornment position="end"> <IconButton aria-label="toggle confirm password visibility" onClick={handleClickShowConfirmPassword} onMouseDown={handleMouseDownPassword} edge="end" disabled={isLoading} > {showConfirmPassword ? <VisibilityOff /> : <Visibility />} </IconButton> </InputAdornment> ),
        }}
      />
      <FormControlLabel
        control={ <Checkbox name="agreedToTerms" color="primary" checked={formData.agreedToTerms} onChange={handleChange} disabled={isLoading} /> }
        label={ <Typography variant="body2"> Tôi cam kết đồng ý với {' '} <MuiLink component={RouterLink} to="/terms" variant="body2" onClick={(e) => {e.preventDefault(); alert('Link to Terms'); /* TODO */}}> điều khoản dịch vụ </MuiLink> {' & '} <MuiLink component={RouterLink} to="/privacy" variant="body2" onClick={(e) => {e.preventDefault(); alert('Link to Privacy'); /* TODO */}}> chính sách bảo mật </MuiLink> {' của IDENTITY APP'} </Typography>}
        sx={{ mt: 1, mb: 1 }}
      />
      {errors.agreedToTerms && !apiMessage && ( <Typography color="error" variant="caption" display="block" sx={{mb:1}}>{errors.agreedToTerms}</Typography> )}

      <Button
        type="submit"
        fullWidth
        variant="contained"
        disabled={isLoading}
        sx={{ mt: 2, mb: 2, py: 1.5, backgroundColor: '#212B36', '&:hover': { backgroundColor: '#454F5B' } }}
        startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
      >
        {isLoading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
      </Button>
    </Box>
  );
};

export default RegisterForm;