// client/src/components/Auth/RegisterForm.js
import React, { useState } from 'react';
import {
  TextField, Button, Box, Typography, Checkbox, FormControlLabel,
  Link as MuiLink, Grid, IconButton, InputAdornment, Alert, CircularProgress
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { register } from '../../services/authService';

const RegisterForm = () => {
  const navigate = useNavigate(); // Khởi tạo hook useNavigate
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
  const [isLoading, setIsLoading] = useState(false);
  const [apiMessage, setApiMessage] = useState(null);
  const [apiErrorDetails, setApiErrorDetails] = useState([]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors(prevErrors => ({ ...prevErrors, [name]: '' }));
    }
    if (apiMessage) setApiMessage(null);
    if (apiErrorDetails.length > 0) setApiErrorDetails([]);
  };

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleClickShowConfirmPassword = () => setShowConfirmPassword((show) => !show);
  const handleMouseDownPassword = (event) => event.preventDefault();

  const validate = () => {
    let tempErrors = {};
    if (!formData.email.trim()) tempErrors.email = "Địa chỉ email là bắt buộc.";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) tempErrors.email = "Địa chỉ email không hợp lệ.";

    if (!formData.password) tempErrors.password = "Mật khẩu là bắt buộc.";
    else if (formData.password.length < 6) tempErrors.password = "Mật khẩu phải có ít nhất 6 ký tự.";

    if (!formData.confirmPassword) tempErrors.confirmPassword = "Xác nhận mật khẩu là bắt buộc.";
    else if (formData.password !== formData.confirmPassword) tempErrors.confirmPassword = "Mật khẩu không khớp.";

    // Họ và Tên không bắt buộc
    // if (!formData.lastName.trim()) tempErrors.lastName = "Họ và tên đệm là bắt buộc.";
    // if (!formData.firstName.trim()) tempErrors.firstName = "Tên là bắt buộc.";

    if (!formData.agreedToTerms) tempErrors.agreedToTerms = "Bạn phải đồng ý với điều khoản dịch vụ.";
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiMessage(null);
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
        const response = await register(payload);
        // Không setApiMessage ở đây nữa nếu muốn chuyển hướng
        // setApiMessage({ type: 'success', text: response.message || "Đăng ký thành công. Vui lòng kiểm tra email." });

        // Reset form và lỗi client-side (vẫn nên làm)
        setFormData({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '', agreedToTerms: false });
        setErrors({});

        // Chuyển hướng đến trang yêu cầu xác thực email
        navigate('/please-verify-email', { state: { email: payload.email } }); // << THAY ĐỔI Ở ĐÂY
        // Truyền email qua state để trang PleaseVerifyEmailPage có thể hiển thị nếu cần

        // setTimeout(() => navigate('/login'), 3000);

      } catch (error) {
        if (error.response && error.response.data) {
            const errorData = error.response.data;
            if (errorData.errors && Array.isArray(errorData.errors)) {
                setApiErrorDetails(errorData.errors.map(err => err.description || err.code));
                setApiMessage({ type: 'error', text: errorData.title || 'Đăng ký thất bại.' });
            } else if (errorData.message) {
                setApiMessage({ type: 'error', text: errorData.message });
            } else if (typeof errorData === 'string') {
                 setApiMessage({ type: 'error', text: errorData });
            } else {
                setApiMessage({ type: 'error', text: 'Lỗi không mong muốn từ máy chủ.' });
            }
        } else {
          setApiMessage({ type: 'error', text: error.message || 'Lỗi mạng hoặc không thể kết nối.' });
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Hàm helper để render TextField với label nổi
  const renderFloatingLabelTextField = ({
    name,
    labelText,
    placeholder,
    type = 'text',
    autoComplete = name,
    isRequired = true,
    autoFocus = false,
    isPasswordType = false,
    showPasswordState,
    togglePasswordVisibility,
  }) => (
    <Box sx={{ position: 'relative', mb: 2.25 }}> {/* mb để tạo khoảng cách giữa các field */}
      <Typography
        variant="caption"
        component="label"
        htmlFor={name}
        sx={{
          position: 'absolute',
          top: '-8px',
          left: '12px',
          backgroundColor: (theme) => theme.palette.background.paper,
          px: '5px',
          fontSize: '11.5px',
          color: errors[name] && !apiMessage ? 'error.main' : 'text.secondary',
          fontWeight: 500,
          zIndex: 1,
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
        value={formData[name]}
        onChange={handleChange}
        error={!!errors[name] && !apiMessage}
        helperText={!apiMessage ? errors[name] : (name === 'password' && !errors[name] && !formData[name] ? 'Tối thiểu 6+ ký tự' : '')}
        disabled={isLoading}
        size="small"
        autoFocus={autoFocus}
        InputProps={isPasswordType ? {
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
        inputProps={{
          style: { paddingTop: '12px', paddingBottom: '12px', fontSize: '14px' }
        }}
      />
    </Box>
  );


  return (
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: '100%' }}>
      {apiMessage && (
        <Alert severity={apiMessage.type} sx={{ mb: 2.5 }} onClose={() => { setApiMessage(null); setApiErrorDetails([]); }}>
          {apiMessage.text}
          {apiErrorDetails.length > 0 && (
            <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px', listStyleType: 'disc' }}>
              {apiErrorDetails.map((detail, index) => (
                <li key={index}>
                  <Typography variant="caption" component="span">
                    {detail}
                  </Typography>
                </li>
              ))}
            </ul>
          )}
        </Alert>
      )}

      {renderFloatingLabelTextField({
        name: "email",
        labelText: "Địa chỉ email",
        placeholder: "nguyenvana@gmail.com",
        autoComplete: "email",
        autoFocus: true
      })}

      {renderFloatingLabelTextField({
        name: "password",
        labelText: "Mật khẩu",
        placeholder: "Tối thiểu 6+ ký tự",
        type: "password", // Sẽ được xử lý bởi isPasswordType
        autoComplete: "new-password",
        isPasswordType: true,
        showPasswordState: showPassword,
        togglePasswordVisibility: handleClickShowPassword
      })}

      {renderFloatingLabelTextField({
        name: "confirmPassword",
        labelText: "Xác nhận mật khẩu",
        placeholder: "", // Để trống placeholder nếu không cần
        type: "password", // Sẽ được xử lý bởi isPasswordType
        autoComplete: "new-password",
        isPasswordType: true,
        showPasswordState: showConfirmPassword,
        togglePasswordVisibility: handleClickShowConfirmPassword
      })}

      <Grid container spacing={1.5} sx={{ mb: 0.75 }}> {/* Giảm mb của Grid */}
        <Grid item xs={12} sm={6}>
          {renderFloatingLabelTextField({
            name: "lastName",
            labelText: "Họ và tên đệm",
            placeholder: "Nguyễn Văn",
            autoComplete: "family-name",
            isRequired: false // Không bắt buộc
          })}
        </Grid>
        <Grid item xs={12} sm={6}>
          {renderFloatingLabelTextField({
            name: "firstName",
            labelText: "Tên",
            placeholder: "A",
            autoComplete: "given-name",
            isRequired: false // Không bắt buộc
          })}
        </Grid>
      </Grid>

      <FormControlLabel
        control={ <Checkbox name="agreedToTerms" color="primary" checked={formData.agreedToTerms} onChange={handleChange} disabled={isLoading} size="small" sx={{p: '4px', mr: 0.25}} /> }
        label={ <Typography variant="body2" sx={{fontSize: '13px', color: 'text.secondary'}}> Tôi cam kết đồng ý với {' '} <MuiLink component={RouterLink} to="/terms" variant="body2" sx={{ fontWeight: 500, fontSize: '13px', color: 'primary.main', textDecoration:'none' }} onClick={(e) => {e.preventDefault(); alert('Link to Terms'); }}> điều khoản dịch vụ & chính sách bảo mật</MuiLink> {' của Vietbando'} </Typography>}
        sx={{ mt: 1, mb: 1, alignItems: 'center' }}
      />
      {errors.agreedToTerms && !apiMessage && ( <Typography color="error" variant="caption" display="block" sx={{mb:1.5, mt: -0.5}}>{errors.agreedToTerms}</Typography> )}

      <Button
        type="submit"
        fullWidth
        variant="contained"
        disabled={isLoading}
        sx={{
          mt: 2,
          mb: 2,
          py: 1.25,
          backgroundColor: '#212B36',
          color: 'common.white',
          fontWeight: 600,
          '&:hover': {
            backgroundColor: '#161C24',
          },
          textTransform: 'none',
          fontSize: '0.9rem',
          boxShadow: 'none',
          borderRadius: '8px'
        }}
        startIcon={isLoading ? <CircularProgress size={18} color="inherit" /> : null}
      >
        {isLoading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
      </Button>
    </Box>
  );
};

export default RegisterForm;