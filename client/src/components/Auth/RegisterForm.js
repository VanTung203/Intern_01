// client/src/components/Auth/RegisterForm.js
import React, { useState } from 'react';
import {
  TextField, Button, Box, Typography, Checkbox, FormControlLabel,
  Link as MuiLink, Grid, IconButton, InputAdornment
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
// import { register } from '../../services/authService'; // Sẽ import sau khi tạo service

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreedToTerms: false,
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Để xử lý trạng thái loading

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleClickShowConfirmPassword = () => setShowConfirmPassword((show) => !show);

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const validate = () => {
    let tempErrors = {};
    if (!formData.email) tempErrors.email = "Địa chỉ email là bắt buộc.";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) tempErrors.email = "Địa chỉ email không hợp lệ.";

    if (!formData.password) tempErrors.password = "Mật khẩu là bắt buộc.";
    else if (formData.password.length < 6) tempErrors.password = "Mật khẩu phải có ít nhất 6 ký tự.";

    if (!formData.confirmPassword) tempErrors.confirmPassword = "Xác nhận mật khẩu là bắt buộc.";
    else if (formData.password !== formData.confirmPassword) tempErrors.confirmPassword = "Mật khẩu không khớp.";

    if (!formData.lastName) tempErrors.lastName = "Họ và tên đệm là bắt buộc."; // "Họ và tên đệm" trong hình mẫu là "Họ và tên đệm"
    if (!formData.firstName) tempErrors.firstName = "Tên là bắt buộc.";       // "Tên" trong hình mẫu là "Tên"

    if (!formData.agreedToTerms) tempErrors.agreedToTerms = "Bạn phải đồng ý với điều khoản dịch vụ.";

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      setIsLoading(true);
      // console.log("Form submitted:", formData);
      try {
        // const response = await register({ // Dữ liệu gửi đi cần khớp với backend
        //   email: formData.email,
        //   password: formData.password,
        //   firstName: formData.firstName,
        //   lastName: formData.lastName,
        //   // ... các trường khác nếu backend yêu cầu
        // });
        // console.log('Registration successful', response);
        // TODO: Xử lý khi đăng ký thành công (ví dụ: chuyển hướng, hiển thị thông báo)
        alert('Đăng ký thành công! (Mô phỏng)'); // Tạm thời
      } catch (error) {
        // console.error('Registration failed', error);
        // setErrors({ ...errors, apiError: error.message || 'Đã có lỗi xảy ra.' });
        alert(`Đăng ký thất bại: ${error.message || 'Lỗi không xác định'} (Mô phỏng)`); // Tạm thời
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: '100%' }}>
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
        error={!!errors.email}
        helperText={errors.email}
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
        error={!!errors.password}
        helperText={errors.password || "Tối thiểu 6+ ký tự"} // Thêm gợi ý từ hình mẫu
        disabled={isLoading}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={handleClickShowPassword}
                onMouseDown={handleMouseDownPassword}
                edge="end"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
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
        error={!!errors.confirmPassword}
        helperText={errors.confirmPassword}
        disabled={isLoading}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle confirm password visibility"
                onClick={handleClickShowConfirmPassword}
                onMouseDown={handleMouseDownPassword}
                edge="end"
              >
                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="lastName" // Theo hình là "Họ và tên đệm"
            label="Họ và tên đệm"
            name="lastName"
            autoComplete="family-name"
            value={formData.lastName}
            onChange={handleChange}
            error={!!errors.lastName}
            helperText={errors.lastName}
            disabled={isLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="firstName" // Theo hình là "Tên"
            label="Tên"
            name="firstName"
            autoComplete="given-name"
            value={formData.firstName}
            onChange={handleChange}
            error={!!errors.firstName}
            helperText={errors.firstName}
            disabled={isLoading}
          />
        </Grid>
      </Grid>
      <FormControlLabel
        control={
          <Checkbox
            name="agreedToTerms"
            color="primary"
            checked={formData.agreedToTerms}
            onChange={handleChange}
            disabled={isLoading}
          />
        }
        label={
          <Typography variant="body2">
            Tôi cam kết đồng ý với {' '}
            <MuiLink component={RouterLink} to="/terms" variant="body2" onClick={(e) => {e.preventDefault(); alert('Link to Terms'); /* TODO */}}>
              điều khoản dịch vụ
            </MuiLink>
            {' & '}
            <MuiLink component={RouterLink} to="/privacy" variant="body2" onClick={(e) => {e.preventDefault(); alert('Link to Privacy'); /* TODO */}}>
              chính sách bảo mật
            </MuiLink>
            {' của IDENTITY APP'} {/* Thay Vietbando bằng tên app của bạn */}
          </Typography>
        }
        sx={{ mt: 1, mb: 1 }}
      />
      {errors.agreedToTerms && <Typography color="error" variant="caption">{errors.agreedToTerms}</Typography>}
      {/* Hiển thị lỗi API chung nếu có */}
      {/* {errors.apiError && <Typography color="error" variant="body2" sx={{ mt: 1 }}>{errors.apiError}</Typography>} */}
      <Button
        type="submit"
        fullWidth
        variant="contained"
        disabled={isLoading}
        sx={{
          mt: 2,
          mb: 2,
          py: 1.5, // Tăng padding chiều dọc cho nút to hơn
          backgroundColor: '#212B36', // Màu tối giống mẫu
          '&:hover': {
            backgroundColor: '#454F5B', // Màu tối hơn khi hover
          },
        }}
      >
        {isLoading ? 'Đang xử lý...' : 'Tạo tài khoản'}
      </Button>
    </Box>
  );
};

export default RegisterForm;