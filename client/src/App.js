// client/src/App.js
import React, { useEffect } from 'react'; // Thêm useEffect
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Routes, Route, Navigate } from 'react-router-dom'; 
import { useAuth } from './context/AuthContext';

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

// Admin Pages
import UserListPage from './pages/admin/UserListPage';

// Routing Components
import PrivateRoute from './components/routing/PrivateRoute'; // THÊM IMPORT NÀY
import AdminRoute from './components/routing/AdminRoute';   // THÊM IMPORT NÀY

import { Typography, Box, CircularProgress } from '@mui/material'; // << THÊM Box VÀO ĐÂY

import { setGlobalAuthHeader } from './api/apiClient';

function App() {
  const { isAuthenticated, user, isLoading } = useAuth();
    
  // Hiển thị loading cho toàn bộ ứng dụng trong khi chờ xác thực
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
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

        {/* User Private Routes */}
        <Route element={<PrivateRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/profile" element={<UserProfilePage />}>
              <Route index element={<Navigate to="info" replace />} />
              <Route path="info" element={<UserProfileInfoForm />} />
              <Route path="security" element={<UserSecurityContent />} />
            </Route>
            {/* Các trang khác của user có thể thêm ở đây */}
          </Route>
        </Route>

        {/* Admin Private Routes */}
        <Route element={<AdminRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/admin/users" element={<UserListPage />} />
            {/* Các trang khác của admin có thể thêm ở đây */}
          </Route>
        </Route>

        {/* Route mặc định */}
        <Route 
          path="/" 
          element={
            isAuthenticated 
              ? (user?.roles?.includes('Admin') ? <Navigate to="/admin/users" replace /> : <Navigate to="/profile" replace />)
              : <Navigate to="/login" replace />
          } 
        />

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
  );
}

export default App;