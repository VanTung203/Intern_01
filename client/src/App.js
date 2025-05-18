// client/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage'; // Đảm bảo component này đã được tạo và hoạt động
import PleaseVerifyEmailPage from './pages/PleaseVerifyEmailPage';
import EmailConfirmedPage from './pages/EmailConfirmedPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage'; // Trang mới
import ForgotPasswordEmailSentPage from './pages/ForgotPasswordEmailSentPage'; // Trang mới
import ResetPasswordPage from './pages/ResetPasswordPage'; // Trang mới
import ResetPasswordSuccessPage from './pages/ResetPasswordSuccessPage'; // Trang mới
import Typography from '@mui/material/Typography';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<RegisterPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} /> {/* Sử dụng LoginPage thật */}
        <Route path="/please-verify-email" element={<PleaseVerifyEmailPage />} />
        <Route path="/email-confirmed" element={<EmailConfirmedPage />} />

        {/* Routes cho Quên mật khẩu */}
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/forgot-password-email-sent" element={<ForgotPasswordEmailSentPage />} />
        {/* Backend gửi token trong email, user sẽ nhập token và email ở trang reset này */}
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        {/* Bạn có thể thêm path variable cho token nếu backend gửi link reset có token:
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
            Hoặc nếu token và email là query params:
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            Hiện tại, theo backend, người dùng sẽ tự nhập token.
        */}
        <Route path="/reset-password-success" element={<ResetPasswordSuccessPage />} />

        <Route path="*" element={<Typography variant="h3" sx={{ textAlign: 'center', mt: 5 }}>404 Page Not Found</Typography>} />
      </Routes>
    </Router>
  );
}

export default App;