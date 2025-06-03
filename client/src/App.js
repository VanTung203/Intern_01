// client/src/App.js
import React, { useEffect } from 'react'; // Thêm useEffect
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import PublicPageLayout from './components/layouts/PublicPageLayout';
import DashboardLayout from './components/layouts/DashboardLayout';

// Public Pages
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import PleaseVerifyEmailPage from './pages/PleaseVerifyEmailPage';
import EmailConfirmedPage from './pages/EmailConfirmedPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ForgotPasswordEmailSentPage from './pages/ForgotPasswordEmailSentPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ResetPasswordSuccessPage from './pages/ResetPasswordSuccessPage';
import TwoFactorAuthPage from './pages/TwoFactorAuthPage';

// Private Pages
import UserProfilePage from './pages/UserProfilePage';
import UserProfileInfoForm from './components/User/UserProfileInfoForm';
import UserSecurityContent from './components/User/UserSecurityContent';

import { Typography, Box } from '@mui/material'; // << THÊM Box VÀO ĐÂY

import { setGlobalAuthHeader } from './api/apiClient';

// Component bảo vệ Route
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('authToken');
  // Có thể thêm logic kiểm tra token hết hạn ở đây nếu cần
  return token ? children : <Navigate to="/login" replace />;
};

function App() {
  // useEffect để thiết lập header xác thực khi ứng dụng tải lần đầu
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setGlobalAuthHeader(token); // Gọi hàm để set header cho apiClient toàn cục
      // Nếu không dùng apiClient chung:
      // import { setAuthHeader as setAuthServiceHeader } from './services/authService';
      // import { setUserAuthHeader as setUserServiceHeader } from './services/userService';
      // setAuthServiceHeader(token);
      // setUserServiceHeader(token);
    }
  }, []); // Mảng rỗng đảm bảo useEffect này chỉ chạy một lần khi component App mount

  return (
    <Router>
      <Routes>
        {/* Public Routes: Không cần DashboardLayout, có thể có PublicPageLayout nếu RegisterPage không tự chứa layout */}
        {/* Nếu RegisterPage và LoginPage đã dùng PublicPageLayout bên trong chúng thì không cần bọc ở đây */}
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/please-verify-email" element={<PleaseVerifyEmailPage />} />
        <Route path="/email-confirmed" element={<EmailConfirmedPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/forgot-password-email-sent" element={<ForgotPasswordEmailSentPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/reset-password-success" element={<ResetPasswordSuccessPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/verify-2fa" element={<TwoFactorAuthPage />} />

        {/* Private Routes using DashboardLayout */}
        {/* Cách tiếp cận 1: Bọc DashboardLayout bằng PrivateRoute */}
        <Route element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
          <Route path="/profile" element={<UserProfilePage />}> {/* UserProfilePage sẽ chứa <Outlet/> cho các tab con */}
            <Route index element={<Navigate to="info" replace />} />
            <Route path="info" element={<UserProfileInfoForm />} />
            <Route path="security" element={<UserSecurityContent />} />
          </Route>
          {/* Ví dụ một trang dashboard khác */}
          {/* <Route path="/dashboard" element={<DashboardHomePage />} /> */}
        </Route>

        {/* Route mặc định */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Trang 404 */}
        <Route path="*" element={
          <PublicPageLayout> {/* Có thể bọc trang 404 bằng layout chung */}
            <Box sx={{textAlign: 'center', py: 5}}>
              <Typography variant="h3">404</Typography>
              <Typography variant="h6">Page Not Found</Typography>
              <Typography sx={{mt:2}}>Xin lỗi, chúng tôi không tìm thấy trang bạn yêu cầu.</Typography>
            </Box>
          </PublicPageLayout>
        } />
      </Routes>
    </Router>
  );
}

export default App;