// client/src/components/Auth/ForgotPasswordForm.js
import React, { useState } from 'react';
import { TextField, Button, Box, Alert, CircularProgress, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { forgotPassword } from '../../services/authService';

// Hàm helper renderTextField (giữ nguyên như đã có, hoặc import từ file chung)
// Đảm bảo hàm này nhận đủ các props như error, disabled, value, onChange, autoFocus, isRequired
const renderFloatingLabelTextField = ({ name, labelText, placeholder, type = 'text', autoComplete = name, isRequired = true, autoFocus = false, value, onChange, error, disabled, InputProps, inputProps }) => (
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
          color: error ? 'error.main' : 'text.secondary', // Màu label khi có lỗi
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
        type={type} // type được truyền vào, không cố định là text
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        error={!!error} // Chuyển error thành boolean
        helperText={error || ''} // Luôn hiển thị error (nếu có) trừ khi bị apiMessage ghi đè
        disabled={disabled}
        size="small"
        autoFocus={autoFocus}
        InputProps={InputProps} // Truyền InputProps cho icon ẩn/hiện mật khẩu nếu cần
        inputProps={inputProps} // Truyền inputProps
      />
    </Box>
  );


const ForgotPasswordForm = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [clientError, setClientError] = useState(''); // Lỗi validation client cho trường email
  const [apiMessage, setApiMessage] = useState(null); // { type: 'success' | 'error', text: string }
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setEmail(e.target.value);
    if (clientError) setClientError(''); // Xóa lỗi client của trường email khi người dùng nhập
    if (apiMessage) setApiMessage(null); // Xóa thông báo API cũ
  };

  const validate = () => {
    if (!email.trim()) {
      setClientError("Địa chỉ email là bắt buộc.");
      return false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setClientError("Địa chỉ email không hợp lệ.");
      return false;
    }
    setClientError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiMessage(null); // Reset thông báo API trước mỗi lần submit
    if (validate()) {
      setIsLoading(true);
      try {
        const response = await forgotPassword({ email }); // API backend trả về { message: "..." }

        // Chuyển hướng đến trang thông báo đã gửi email,
        // truyền email và message từ server qua location.state
        navigate('/forgot-password-email-sent', {
          state: {
            emailSentTo: email, // Sử dụng key 'emailSentTo' cho nhất quán
            messageFromServer: response.message || "Nếu tài khoản của bạn tồn tại, hướng dẫn đặt lại mật khẩu đã được gửi."
          }
        });

      } catch (error) {
        // Backend hiện tại không ném lỗi cho email không tồn tại,
        // nó trả về Ok với một message.
        // Lỗi ở đây sẽ là lỗi mạng hoặc lỗi server 500.
        setApiMessage({
          type: 'error',
          text: error.response?.data?.message || error.message || "Đã có lỗi xảy ra khi gửi yêu cầu."
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: '100%' }}>
      {/* Chỉ hiển thị apiMessage nếu có lỗi API, không hiển thị nếu là lỗi validation client */}
      {apiMessage && (
        <Alert severity={apiMessage.type} sx={{ mb: 2 }} onClose={() => setApiMessage(null)}>
          {apiMessage.text}
        </Alert>
      )}

      {/* Sử dụng hàm helper đã được chuẩn hóa */}
      {renderFloatingLabelTextField({
        name: "email", // name phải là "email" để khớp với state và handleChange
        labelText: "Địa chỉ email",
        placeholder: "Nhập email của bạn",
        value: email, // value phải là state email
        onChange: handleChange,
        error: clientError, // Chỉ truyền clientError
        disabled: isLoading,
        autoFocus: true,
        isRequired: true,
        type: "email", // Thêm type="email" để trình duyệt có thể validate cơ bản
        autoComplete: "email"
      })}

      <Button
        type="submit"
        fullWidth
        variant="contained"
        disabled={isLoading}
        sx={{
          mt: 2, // Giữ hoặc điều chỉnh margin top
          py: 1.25,
          backgroundColor: '#212B36',
          '&:hover': { backgroundColor: '#161C24' },
          color: 'common.white',
          fontWeight: 600,
          borderRadius: '8px',
          textTransform:'none'
        }}
        startIcon={isLoading ? <CircularProgress size={18} color="inherit" /> : null}
      >
        {isLoading ? 'Đang gửi...' : 'Gửi Yêu Cầu'}
      </Button>
    </Box>
  );
};

export default ForgotPasswordForm;