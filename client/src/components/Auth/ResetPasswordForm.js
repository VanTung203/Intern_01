// client/src/components/Auth/ResetPasswordForm.js
import React, { useState } /* useEffect không dùng */ from 'react';
import { TextField, Button, Box, Alert, CircularProgress, Typography, IconButton, InputAdornment } from '@mui/material';
import { useNavigate /* useLocation không dùng */ } from 'react-router-dom';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { resetPassword } from '../../services/authService';

// Hàm helper renderFloatingLabelTextField (giữ nguyên)
const renderFloatingLabelTextField = ({
  name,
  labelText,
  placeholder,
  type = 'text',
  autoComplete = name,
  isRequired = true,
  autoFocus = false,
  value,
  onChange,
  error,
  disabled,
  InputProps,
  inputProps
}) => (
  <Box sx={{ position: 'relative', mb: 2.25 }}>
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
        color: error ? 'error.main' : 'text.secondary',
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
      type={type}
      autoComplete={autoComplete}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      error={!!error}
      helperText={error || ''}
      disabled={disabled}
      size="small"
      autoFocus={autoFocus}
      InputProps={InputProps}
      inputProps={inputProps}
    />
  </Box>
);


const ResetPasswordForm = ({ emailToReset }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    // Giữ tên 'token' để khớp với DTO backend, nhưng nó sẽ chứa OTP
    token: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiMessage, setApiMessage] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Nếu là trường OTP, chỉ cho phép nhập số và giới hạn 6 ký tự
    if (name === "token") {
        const numericValue = value.replace(/\D/g, ''); // Chỉ giữ lại số
        setFormData(prevData => ({ ...prevData, [name]: numericValue.slice(0, 6) })); // Giới hạn 6 ký tự
    } else {
        setFormData(prevData => ({ ...prevData, [name]: value }));
    }

    if (errors[name]) {
      setErrors(prevErrors => ({ ...prevErrors, [name]: '' }));
    }
    if (apiMessage) setApiMessage(null);
  };

  const handleClickShowNewPassword = () => setShowNewPassword(s => !s);
  const handleClickShowConfirmNewPassword = () => setShowConfirmNewPassword(s => !s);
  const handleMouseDownPassword = (event) => event.preventDefault();

  const validate = () => {
    let tempErrors = {};
    // Thay đổi validate cho token (OTP)
    if (!formData.token.trim()) tempErrors.token = "Mã OTP là bắt buộc.";
    else if (formData.token.length !== 6) tempErrors.token = "Mã OTP phải có 6 chữ số.";
    else if (!/^\d{6}$/.test(formData.token)) tempErrors.token = "Mã OTP chỉ được chứa chữ số.";


    if (!formData.newPassword) tempErrors.newPassword = "Mật khẩu mới là bắt buộc.";
    else if (formData.newPassword.length < 6) tempErrors.newPassword = "Mật khẩu mới phải có ít nhất 6 ký tự.";
    if (!formData.confirmNewPassword) tempErrors.confirmNewPassword = "Xác nhận mật khẩu mới là bắt buộc.";
    else if (formData.newPassword !== formData.confirmNewPassword) tempErrors.confirmNewPassword = "Mật khẩu mới không khớp.";
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiMessage(null);

    if (!emailToReset) {
        setApiMessage({ type: 'error', text: 'Thông tin email không hợp lệ. Vui lòng thử lại từ đầu.' });
        return;
    }

    if (validate()) {
      setIsLoading(true);
      try {
        const payload = {
          email: emailToReset,
          token: formData.token, // Đây sẽ là OTP 6 số
          newPassword: formData.newPassword,
        };
        const response = await resetPassword(payload);

        navigate('/reset-password-success', { state: { message: response.message || "Mật khẩu đã được đặt lại thành công!" } });

      } catch (error) {
        const errorData = error.response?.data;
        // Kiểm tra lỗi cụ thể từ backend nếu token không hợp lệ hoặc hết hạn
        if (errorData?.message && (errorData.message.includes("OTP không hợp lệ") || errorData.message.includes("Invalid token"))) {
            setApiMessage({ type: 'error', text: "Mã OTP không đúng hoặc đã hết hạn. Vui lòng thử lại." });
            setErrors(prev => ({...prev, token: "Mã OTP không đúng hoặc đã hết hạn."})); // Highlight trường token
        } else if (errorData?.errors && Array.isArray(errorData.errors)) {
            setApiMessage({ type: 'error', text: errorData.title || 'Đặt lại mật khẩu thất bại.', details: errorData.errors }); // Gửi nguyên mảng errors
        } else if (errorData?.message) {
            setApiMessage({ type: 'error', text: errorData.message });
        } else if (typeof errorData === 'string') {
            setApiMessage({ type: 'error', text: errorData });
        } else {
            setApiMessage({ type: 'error', text: error.message || 'Lỗi không mong muốn xảy ra.' });
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: '100%' }}>
      {apiMessage && (
        <Alert severity={apiMessage.type} sx={{ mb: 2.5 }} onClose={() => {setApiMessage(null)}}>
          {apiMessage.text}
          {/* Sửa lại cách hiển thị details nếu nó là mảng string (description từ IdentityError) */}
          {apiMessage.details && Array.isArray(apiMessage.details) && apiMessage.details.length > 0 && (
            <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px', listStyleType: 'disc' }}>
              {apiMessage.details.map((detail, index) => (
                <li key={index}><Typography variant="caption" component="span">{typeof detail === 'string' ? detail : (detail.description || detail.code || 'Lỗi không xác định')}</Typography></li>
              ))}
            </ul>
          )}
        </Alert>
      )}

      {/* Thay đổi label và placeholder cho trường token/OTP */}
      {renderFloatingLabelTextField({
        name: "token",
        labelText: "Mã OTP", // ĐỔI LABEL
        placeholder: "Nhập mã OTP 6 số từ email", // ĐỔI PLACEHOLDER
        value: formData.token,
        onChange: handleChange,
        error: errors.token,
        disabled: isLoading,
        autoFocus: true,
        isRequired: true,
        autoComplete: "one-time-code", // Giúp trình duyệt gợi ý nếu có
        // type: "tel", // Gợi ý bàn phím số trên mobile
        inputProps: { // Giới hạn input client-side (server vẫn là nguồn chính)
            maxLength: 6,
            inputMode: "numeric", // Gợi ý bàn phím số
            pattern: "[0-9]*", // Chỉ cho phép số (HTML5 validation)
            style: { paddingTop: '12px', paddingBottom: '12px', fontSize: '14px' }
        }
      })}

      {/* Các trường mật khẩu giữ nguyên */}
      {renderFloatingLabelTextField({
        name: "newPassword",
        labelText: "Mật khẩu mới",
        placeholder: "Tối thiểu 6+ ký tự",
        type: showNewPassword ? "text" : "password",
        autoComplete: "new-password",
        value: formData.newPassword,
        onChange: handleChange,
        error: errors.newPassword,
        disabled: isLoading,
        isRequired: true,
        InputProps:{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle new password visibility"
                onClick={handleClickShowNewPassword}
                onMouseDown={handleMouseDownPassword}
                edge="end"
                size="small"
                sx={{color: 'text.secondary', mr: -0.5}}
                disabled={isLoading}
              >
                {showNewPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
              </IconButton>
            </InputAdornment>
          )
        },
        inputProps: { style: { paddingTop: '12px', paddingBottom: '12px', fontSize: '14px' } }
      })}

      {renderFloatingLabelTextField({
        name: "confirmNewPassword",
        labelText: "Xác nhận mật khẩu mới",
        placeholder: "Nhập lại mật khẩu mới",
        type: showConfirmNewPassword ? "text" : "password",
        autoComplete: "new-password",
        value: formData.confirmNewPassword,
        onChange: handleChange,
        error: errors.confirmNewPassword,
        disabled: isLoading,
        isRequired: true,
        InputProps:{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle confirm new password visibility"
                onClick={handleClickShowConfirmNewPassword}
                onMouseDown={handleMouseDownPassword}
                edge="end"
                size="small"
                sx={{color: 'text.secondary', mr: -0.5}}
                disabled={isLoading}
              >
                {showConfirmNewPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
              </IconButton>
            </InputAdornment>
          )
        },
        inputProps: { style: { paddingTop: '12px', paddingBottom: '12px', fontSize: '14px' } }
      })}

      <Button
        type="submit"
        fullWidth
        variant="contained"
        disabled={isLoading || !emailToReset}
        sx={{
          mt: 2,
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
        {isLoading ? 'Đang xử lý...' : 'Đặt Lại Mật Khẩu'}
      </Button>
    </Box>
  );
};
export default ResetPasswordForm;