// client/src/layouts/DashboardLayout.js
import React, { useState, useEffect } from 'react';
import { /* AppBar, Toolbar, Typography, */ Container, Box, /* Button, IconButton, Avatar, */ CssBaseline, CircularProgress /*, Menu, MenuItem, Tooltip */ } from '@mui/material'; // Comment out các import không dùng đến từ AppBar
import { /* Link as RouterLink, */ Outlet, useNavigate } from 'react-router-dom';

import { logout } from '../../services/authService';
import { getUserProfile } from '../../services/userService';
import { setGlobalAuthHeader } from '../../api/apiClient';


const DashboardLayout = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null); // Vẫn cần để kiểm tra auth và có thể cho các trang con
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [anchorElUser, setAnchorElUser] = useState(null); // Không cần nếu không có user menu trong AppBar

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setGlobalAuthHeader(token);
      const fetchProfile = async () => {
        setIsLoadingProfile(true);
        try {
          const profileData = await getUserProfile();
          setCurrentUser(profileData);
        } catch (error) {
          console.error("DashboardLayout: Failed to fetch user profile", error.response?.data || error.message);
          if (error.response && error.response.status === 401) {
            handleLogoutAndRedirect();
          }
        } finally {
          setIsLoadingProfile(false);
        }
      };
      fetchProfile();
    } else {
      navigate('/login', { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  // const handleOpenUserMenu = (event) => setAnchorElUser(event.currentTarget); // Không cần
  // const handleCloseUserMenu = () => setAnchorElUser(null); // Không cần

  const handleLogoutAndRedirect = () => {
    logout();
    setCurrentUser(null);
    navigate('/login', { replace: true });
    // handleCloseUserMenu(); // Không cần
  };

  // const handleGoToProfile = () => { // Logic này sẽ nằm trong UserProfilePage hoặc nơi khác nếu cần
  //   navigate('/profile/info');
  //   // handleCloseUserMenu();
  // };

  // const filesBaseUrl = process.env.REACT_APP_API_BASE_URL_FOR_FILES || ''; // Vẫn có thể cần nếu currentUser được truyền xuống Outlet và sử dụng avatarUrl

  if (isLoadingProfile && !currentUser) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: (theme) => theme.palette.grey[100] }}>
        <CircularProgress />
      </Box>
    );
  }
  // Nếu chỉ isLoadingProfile (tức là đã có currentUser từ lần load trước), không hiển thị loading toàn trang nữa
  // mà để các trang con tự quản lý trạng thái loading của chúng.

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: (theme) => theme.palette.grey[100] /* Hoặc theme.palette.background.default nếu đã config */ }}>
      <CssBaseline />
      {/* TOÀN BỘ PHẦN APPBAR ĐÃ BỊ LOẠI BỎ */}
      {/* <AppBar
        position="sticky"
        // ...
      >
        // ...
      </AppBar> */}

      <Container
        component="main"
        maxWidth="lg" // Bạn có thể giữ 'lg' hoặc đổi thành false nếu muốn nội dung tràn viền hơn, tùy theo ý đồ thiết kế tổng thể
        sx={{
          flexGrow: 1,
          // Điều chỉnh padding cho phù hợp khi không có AppBar
          // Có thể tăng paddingTop một chút nếu cần
          py: { xs: 3, sm: 4, md: 4 }, // Ví dụ: tăng padding top/bottom
          mt: 0, // Quan trọng: Bỏ margin top vì không còn AppBar
        }}
      >
        {/* Truyền currentUser xuống cho Outlet nếu các trang con cần thông tin này */}
        {/* Nếu không, bạn có thể để <Outlet />σκέτο */}
        <Outlet context={{ currentUser }} />
      </Container>
    </Box>
  );
};

export default DashboardLayout;