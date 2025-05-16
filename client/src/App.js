// client/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// Bỏ MainLayout nếu trang đăng ký không dùng chung layout đó
// import MainLayout from './components/Layout/MainLayout';
import Typography from '@mui/material/Typography'; // Vẫn cần nếu dùng ở các trang khác
import RegisterPage from './pages/RegisterPage'; // Import trang đăng ký
// import LoginPage from './pages/LoginPage'; // Sẽ tạo sau

// Component cho Route private (nếu cần sau này)
// const isAuthenticated = () => false;
// const PrivateRoute = ({ children }) => {
//   return isAuthenticated() ? children : <Navigate to="/login" replace />;
// };

const LoginPagePlaceholder = () => <Typography variant="h4">Login Page Placeholder</Typography>;
// Các placeholder khác nếu cần

function App() {
  return (
    <Router>
      <Routes>
        {/* Trang đăng ký sẽ là trang chính, không dùng MainLayout chung */}
        <Route path="/" element={<RegisterPage />} />
        <Route path="/register" element={<RegisterPage />} /> {/* Có thể giữ lại để tường minh */}
        <Route path="/login" element={<LoginPagePlaceholder />} /> {/* Trang đăng nhập sẽ tạo sau */}

        {/* Các routes khác có thể dùng MainLayout nếu cần */}
        {/*
        <Route path="/app" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route
            path="profile"
            element={
              <PrivateRoute>
                <ProfilePagePlaceholder />
              </PrivateRoute>
            }
          />
        </Route>
        */}
        <Route path="*" element={<Typography variant="h3" sx={{ textAlign: 'center', mt: 5 }}>404 Page Not Found</Typography>} />
      </Routes>
    </Router>
  );
}

export default App;