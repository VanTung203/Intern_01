// client/src/components/Auth/ChangePasswordForm.js
import React, { useState } from 'react';
import {
  TextField, Button, Box, Alert, CircularProgress, Typography,
  IconButton, InputAdornment
} from '@mui/material';
// Bỏ useNavigate nếu không dùng trong component này
// import { Link as RouterLink, useNavigate } from 'react-router-dom';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { changePassword } from '../../services/authService'; // Đảm bảo hàm này có trong authService

// Hàm helper renderTextField
const renderFloatingLabelTextField = ({
  name,
  labelText,
  placeholder,
  type = 'text',
  value,
  onChange,
  error,
  disabled,
  InputProps, // Cho icon mật khẩu
  inputProps, // Cho style bên trong input
  isRequired = true,
  autoFocus = false
}) => (
  <Box sx={{ position: 'relative', mb: 2.5 }}>
    <Typography
      variant="caption"
      component="label"
      htmlFor={name}
      sx={{
        position: 'absolute',
        top: '-9px',
        left: '12px',
        backgroundColor: (theme) => theme.palette.background.paper,
        px: '5px',
        fontSize: '11.5px',
        color: error ? 'error.main' : 'text.secondary',
        fontWeight: 100,
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
      autoComplete={name.includes('newPassword') ? "new-password" : "current-password"}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      error={!!error}
      helperText={error || ''}
      disabled={disabled}
      size="small"
      autoFocus={autoFocus}
      InputProps={InputProps}
      inputProps={inputProps || { style: { paddingTop: '10px', paddingBottom: '10px', fontSize: '0.9rem' } }}
      variant="outlined" // Đảm bảo luôn sử dụng variant "outlined" để có viền
      // **THÊM ĐOẠN CODE CỦA BẠN VÀO ĐÂY**
      sx={{
        '& .MuiOutlinedInput-root': {
          backgroundColor: 'transparent', // Đảm bảo không có màu nền mặc định cho TextField
          '& fieldset': { // Nhắm mục tiêu vào phần viền
            borderColor: '#c0c0c0', // Màu viền mặc định
          },
          '&:hover fieldset': {
            borderColor: '#808080', // Màu viền khi hover
          },
          '&.Mui-focused fieldset': {
            borderColor: (theme) => theme.palette.primary.main, // Màu viền khi focus
            borderWidth: '2px', // Độ dày viền khi focus
          },
          // Xóa màu nền khi disabled cho phần root của TextField
          '&.Mui-disabled': {
            backgroundColor: 'transparent',
          },
        },
      }}
    />
  </Box>
);

const ChangePasswordForm = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiMessage, setApiMessage] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
    if (errors[name]) {
      setErrors(prevErrors => ({ ...prevErrors, [name]: '' }));
    }
    if (apiMessage) setApiMessage(null);
  };

  const handleClickShowCurrentPassword = () => setShowCurrentPassword(s => !s);
  const handleClickShowNewPassword = () => setShowNewPassword(s => !s);
  const handleClickShowConfirmNewPassword = () => setShowConfirmNewPassword(s => !s);
  const handleMouseDownPassword = (event) => event.preventDefault();

  const validate = () => {
    let tempErrors = {};
    if (!formData.currentPassword) {
      tempErrors.currentPassword = "Mật khẩu hiện tại là bắt buộc.";
    }
    if (!formData.newPassword) {
      tempErrors.newPassword = "Mật khẩu mới là bắt buộc.";
    } else if (formData.newPassword.length < 6) {
      tempErrors.newPassword = "Mật khẩu mới phải có ít nhất 6 ký tự.";
    }
    if (!formData.confirmNewPassword) {
      tempErrors.confirmNewPassword = "Xác nhận mật khẩu mới là bắt buộc.";
    } else if (formData.newPassword !== formData.confirmNewPassword) {
      tempErrors.confirmNewPassword = "Mật khẩu mới và mật khẩu xác nhận không khớp.";
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiMessage(null);
    if (validate()) {
      setIsLoading(true);
      try {
        const response = await changePassword({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
          confirmNewPassword: formData.confirmNewPassword,
        });
        setApiMessage({ type: 'success', text: response.message || "Đổi mật khẩu thành công!" });
        setFormData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
        setErrors({});
      } catch (error) {
        const errorData = error.response?.data;
        if (errorData?.errors && Array.isArray(errorData.errors)) {
          setApiMessage({ type: 'error', text: errorData.title || 'Đổi mật khẩu thất bại.', details: errorData.errors.map(err => err.description || err.code) });
        } else if (errorData?.message) {
          setApiMessage({ type: 'error', text: errorData.message });
        } else if (typeof errorData === 'string') {
          setApiMessage({ type: 'error', text: errorData });
        } else {
          setApiMessage({ type: 'error', text: error.message || 'Lỗi không mong muốn.' });
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  const isFormValid = formData.currentPassword && formData.newPassword && formData.confirmNewPassword && Object.keys(errors).every(key => !errors[key]);


  return (
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: '100%', maxWidth: 1000 }}>
      {apiMessage && (
        <Alert severity={apiMessage.type} sx={{ mb: 2 }} onClose={() => setApiMessage(null)}>
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
        name: "currentPassword",
        labelText: "Mật khẩu của bạn",
        type: showCurrentPassword ? "text" : "password",
        value: formData.currentPassword,
        onChange: handleChange,
        error: errors.currentPassword,
        disabled: isLoading,
        autoFocus: true,
        isRequired: true,
        InputProps:{ endAdornment: ( <InputAdornment position="end"> <IconButton aria-label="toggle current password visibility" onClick={handleClickShowCurrentPassword} onMouseDown={handleMouseDownPassword} edge="end" size="small" sx={{color: 'text.secondary', mr: -0.5}}> {showCurrentPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />} </IconButton> </InputAdornment> ), style: { paddingTop: '5px', paddingBottom: '5px', fontSize: '0.9rem' }},
      })}
      {renderFloatingLabelTextField({
        name: "newPassword",
        labelText: "Mật khẩu mới",
        type: showNewPassword ? "text" : "password",
        value: formData.newPassword,
        onChange: handleChange,
        error: errors.newPassword,
        disabled: isLoading,
        placeholder:"Tối thiểu 6+ ký tự",
        isRequired: true,
        InputProps:{ endAdornment: ( <InputAdornment position="end"> <IconButton aria-label="toggle new password visibility" onClick={handleClickShowNewPassword} onMouseDown={handleMouseDownPassword} edge="end" size="small" sx={{color: 'text.secondary', mr: -0.5}}> {showNewPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />} </IconButton> </InputAdornment> ), style: { paddingTop: '5px', paddingBottom: '5px', fontSize: '0.9rem' }},
      })}
      {renderFloatingLabelTextField({
        name: "confirmNewPassword",
        labelText: "Xác nhận mật khẩu mới",
        type: showConfirmNewPassword ? "text" : "password",
        value: formData.confirmNewPassword,
        onChange: handleChange,
        error: errors.confirmNewPassword,
        disabled: isLoading,
        isRequired: true,
        InputProps:{ endAdornment: ( <InputAdornment position="end"> <IconButton aria-label="toggle confirm new password visibility" onClick={handleClickShowConfirmNewPassword} onMouseDown={handleMouseDownPassword} edge="end" size="small" sx={{color: 'text.secondary', mr: -0.5}}> {showConfirmNewPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />} </IconButton> </InputAdornment> ), style: { paddingTop: '5px', paddingBottom: '5px', fontSize: '0.9rem' }},
      })}

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2.5 }}>
        <Button
          type="submit"
          variant="contained"
          disabled={isLoading || !formData.currentPassword || !formData.newPassword || !formData.confirmNewPassword || Object.values(errors).some(e => !!e)}
          sx={(theme) => ({
            py: 1,
            px: 2.5,
            fontWeight: 600,
            fontSize: '0.875rem',
            textTransform: 'none',
            boxShadow: 'none',
            borderRadius: '8px',
            ...( (isLoading || !formData.currentPassword || !formData.newPassword || !formData.confirmNewPassword || Object.values(errors).some(e => !!e)) ?
              {
                backgroundColor: 'grey.300',
                color: 'text.disabled',
                '&:hover': {
                  backgroundColor: 'grey.300',
                }
              } : {
                backgroundColor: theme.palette.grey[800],
                color: theme.palette.common.white,
                '&:hover': {
                  backgroundColor: theme.palette.grey[900],
                }
              }
            )
          })}
        >
          {isLoading ? <CircularProgress size={20} color="inherit" sx={{mr:1}} /> : null}
          {isLoading ? "Đang cập nhật..." : "Cập nhật"}
        </Button>
      </Box>
    </Box>
  );
};
export default ChangePasswordForm;