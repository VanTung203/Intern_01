// client/src/pages/EmailConfirmedPage.js
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { Box, Container, Typography, Paper, CircularProgress, Button, AppBar, Toolbar, Link as MuiLink } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { confirmEmail } from '../services/authService'; // Import hàm API

// Component Logo (có thể dùng chung)
const VietbandoLogoWithText = () => (
    <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => window.location.href = '/'}>
        <img
            src={`${process.env.PUBLIC_URL}/logo_Vietbando.png`}
            alt="Vietbando Logo"
            style={{ height: '30px', marginRight: '10px' }}
        />
        <Typography variant="h6" component="div" sx={{ color: 'text.primary', fontWeight: 700, fontSize: '1.3rem' }}>
            vietbando
        </Typography>
    </Box>
);


const EmailConfirmedPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('Đang xác thực email của bạn...');

  useEffect(() => {
    const userId = searchParams.get('userId');
    const token = searchParams.get('token');

    if (userId && token) {
      const verify = async () => {
        try {
          // API backend của bạn hiện đang redirect phía server khi thành công
          // Chúng ta sẽ gọi nó, và nếu nó không ném lỗi, giả định là thành công
          // và chuẩn bị redirect phía client (hoặc backend sẽ tự redirect)
          // Nếu backend trả về JSON { redirectTo: "..." } thì càng tốt
          const response = await confirmEmail(userId, token);

          // Kiểm tra xem backend có trả về thông tin redirect không
          if (response && response.redirectTo) {
            setStatus('success');
            setMessage('Đã xác thực email thành công! Đang chuyển hướng đến trang đăng nhập...');
            setTimeout(() => {
              window.location.href = response.redirectTo; // Dùng window.location.href để thực hiện redirect mà backend muốn
            }, 2000);
          } else if (response && response.message && response.message.toLowerCase().includes('thành công')) {
            // Nếu backend chỉ trả về message thành công mà không có redirectTo
            setStatus('success');
            setMessage('Đã xác thực email thành công! Bạn có thể đăng nhập ngay.');
            // setTimeout(() => navigate('/login'), 3000); // Tự chuyển hướng phía client
          }
           else { // Mặc định nếu không có redirectTo, coi như thành công và user tự login
            setStatus('success');
            setMessage(response.message || 'Đã xác thực email thành công! Bạn có thể đăng nhập ngay.');
          }
        } catch (error) {
          setStatus('error');
          setMessage(error.response?.data?.message || error.message || 'Xác thực email thất bại. Vui lòng thử lại hoặc liên hệ hỗ trợ.');
        }
      };
      verify();
    } else {
      setStatus('error');
      setMessage('Yêu cầu xác thực không hợp lệ. Thiếu thông tin người dùng hoặc token.');
    }
  }, [searchParams, navigate]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'background.default' }}>
        <AppBar position="static" color="transparent" elevation={0} sx={{ borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}>
            <Container maxWidth="lg">
            <Toolbar disableGutters sx={{ justifyContent: 'space-between', py: 1.25, minHeight: { xs: 56, sm: 64 } }}>
                <VietbandoLogoWithText />
                {status !== 'verifying' && (
                    <Button component={RouterLink} to="/login" color="primary" variant="outlined" size="small">
                        Đến trang Đăng nhập
                    </Button>
                )}
            </Toolbar>
            </Container>
        </AppBar>
        <Container component="main" maxWidth="sm" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Paper elevation={3} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', borderRadius: 2, textAlign: 'center' }}>
            {status === 'verifying' && <CircularProgress sx={{ mb: 2 }} />}
            {status === 'success' && <CheckCircleOutlineIcon sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />}
            {status === 'error' && <ErrorOutlineIcon sx={{ fontSize: 60, color: 'error.main', mb: 2 }} />}
            <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold', mb: 2 }}>
                {status === 'success' ? 'Xác thực thành công!' : (status === 'error' ? 'Xác thực thất bại!' : 'Đang xử lý...')}
            </Typography>
            <Typography variant="body1" color="text.secondary">
                {message}
            </Typography>
            {status !== 'verifying' && (
                <Button component={RouterLink} to="/login" variant="contained" sx={{ mt: 3 }}>
                Đi đến Đăng nhập
                </Button>
            )}
            </Paper>
        </Container>
    </Box>
  );
};

export default EmailConfirmedPage;