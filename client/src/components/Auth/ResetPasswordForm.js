// client/src/components/Auth/ResetPasswordForm.js
import React, { useState, useEffect } from 'react';
import { TextField, Button, Box, Alert, CircularProgress, Typography, IconButton, InputAdornment } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom'; // Thêm useLocation
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { resetPassword } from '../../services/authService';

// Hàm helper renderTextField (Bạn có thể tách ra file chung src/components/common/FloatingLabelTextField.js)
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
  InputProps, // Để truyền endAdornment cho icon mật khẩu
  inputProps  // Để style bên trong input
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


const ResetPasswordForm = ({ emailToReset }) => { // Nhận emailToReset qua props
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    token: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiMessage, setApiMessage] = useState(null); // { type, text, details? }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
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
    if (!formData.token.trim()) tempErrors.token = "Mã token là bắt buộc.";
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
          email: emailToReset, // Sử dụng email được truyền vào
          token: formData.token,
          newPassword: formData.newPassword,
        };
        const response = await resetPassword(payload); // API backend trả về { message: "..." }

        // Chuyển hướng đến trang thành công, truyền message từ server
        navigate('/reset-password-success', { state: { message: response.message || "Mật khẩu đã được đặt lại thành công!" } });

      } catch (error) {
        const errorData = error.response?.data;
        if (errorData?.errors && Array.isArray(errorData.errors)) {
            setApiMessage({ type: 'error', text: errorData.title || 'Đặt lại mật khẩu thất bại.', details: errorData.errors.map(err => err.description || err.code) });
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
          {apiMessage.details && apiMessage.details.length > 0 && (
            <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px', listStyleType: 'disc' }}>
              {apiMessage.details.map((detail, index) => (
                <li key={index}><Typography variant="caption" component="span">{detail}</Typography></li>
              ))}
            </ul>
          )}
        </Alert>
      )}

      {renderFloatingLabelTextField({
        name: "token",
        labelText: "Mã Token",
        placeholder: "Nhập mã token từ email",
        value: formData.token,
        onChange: handleChange,
        error: errors.token,
        disabled: isLoading,
        autoFocus: true, // Focus vào trường token đầu tiên
        isRequired: true
      })}

      {renderFloatingLabelTextField({
        name: "newPassword",
        labelText: "Mật khẩu mới",
        placeholder: "Tối thiểu 6+ ký tự",
        type: showNewPassword ? "text" : "password", // Sử dụng type riêng cho hàm helper
        autoComplete: "new-password",
        value: formData.newPassword,
        onChange: handleChange,
        error: errors.newPassword,
        disabled: isLoading,
        isRequired: true,
        InputProps:{ // Truyền InputProps vào hàm helper
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
        type: showConfirmNewPassword ? "text" : "password", // Sử dụng type riêng
        autoComplete: "new-password",
        value: formData.confirmNewPassword,
        onChange: handleChange,
        error: errors.confirmNewPassword,
        disabled: isLoading,
        isRequired: true,
        InputProps:{ // Truyền InputProps
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
        disabled={isLoading || !emailToReset} // Disable nếu không có emailToReset
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