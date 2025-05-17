// client/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage'; // Giả sử bạn đã tạo LoginPage
import PleaseVerifyEmailPage from './pages/PleaseVerifyEmailPage'; // Trang mới
import EmailConfirmedPage from './pages/EmailConfirmedPage';   // Trang mới
import Typography from '@mui/material/Typography'; // Nếu dùng cho trang 404

// Placeholder cho LoginPage nếu chưa có
const LoginPagePlaceholder = () => <Typography variant="h4" sx={{textAlign: 'center', mt: 5}}>Login Page Placeholder</Typography>;


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<RegisterPage />} /> {/* Hoặc một trang chủ khác */}
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPagePlaceholder />} /> {/* Thay bằng LoginPage thật */}
        <Route path="/please-verify-email" element={<PleaseVerifyEmailPage />} />
        <Route path="/email-confirmed" element={<EmailConfirmedPage />} /> {/* Route để xử lý link xác thực */}
        <Route path="*" element={<Typography variant="h3" sx={{ textAlign: 'center', mt: 5 }}>404 Page Not Found</Typography>} />
      </Routes>
    </Router>
  );
}

export default App;