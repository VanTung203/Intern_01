// client/src/layouts/DashboardLayout.js
import React, { useState, useEffect } from 'react'; // Bỏ useContext nếu không dùng AuthContext trực tiếp ở đây
import { AppBar, Toolbar, Typography, Container, Box, Button, IconButton, Avatar, CssBaseline, CircularProgress, Menu, MenuItem, Tooltip } from '@mui/material';
import { Link as RouterLink, Outlet, useNavigate } from 'react-router-dom';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import MenuIcon from '@mui/icons-material/Menu'; // Cho mobile drawer (nếu bạn muốn phát triển sau)

import { logout } from '../../services/authService';         // Đường dẫn đúng: ../services/authService
import { getUserProfile } from '../../services/userService';   // Đường dẫn đúng: ../services/userService
import { setGlobalAuthHeader } from '../../api/apiClient';     // << ĐƯỜNG DẪN ĐÚNG ĐẾN apiClient.js

// Component Logo
const AppLogo = () => (
    <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', mr: 2 }} onClick={() => window.location.href = '/'}>
        <img src={`${process.env.PUBLIC_URL}/logo_Vietbando.png`} alt="App Logo" style={{ height: '30px', marginRight: '8px' }}/>
        <Typography variant="h6" component="div" sx={{ color: 'text.primary', fontWeight: 700, fontSize: '1.25rem' }}>
            vietbando
        </Typography>
    </Box>
);

const DashboardLayout = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [anchorElUser, setAnchorElUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setGlobalAuthHeader(token); // << SỬ DỤNG setGlobalAuthHeader TỪ apiClient.js
      const fetchProfile = async () => {
        setIsLoadingProfile(true);
        try {
          const profileData = await getUserProfile();
          setCurrentUser(profileData);
        } catch (error) {
          console.error("DashboardLayout: Failed to fetch user profile", error.response?.data || error.message);
          if (error.response && error.response.status === 401) {
            handleLogoutAndRedirect(); // Đổi tên hàm để rõ ràng hơn
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
  }, [navigate]); // navigate thường không thay đổi, nhưng thêm vào để eslint không cảnh báo

  const handleOpenUserMenu = (event) => setAnchorElUser(event.currentTarget);
  const handleCloseUserMenu = () => setAnchorElUser(null);

  // Đổi tên hàm để rõ ràng hơn
  const handleLogoutAndRedirect = () => {
    logout(); // Hàm này từ authService.js sẽ gọi setGlobalAuthHeader(null)
    setCurrentUser(null);
    navigate('/login', { replace: true });
    handleCloseUserMenu(); // Đóng menu nếu đang mở
  };

  const handleGoToProfile = () => {
    navigate('/profile/info');
    handleCloseUserMenu();
  };

  // Biến môi trường để nối với avatarUrl từ backend
  // Đảm bảo bạn có REACT_APP_API_BASE_URL_FOR_FILES trong file .env
  // Ví dụ: REACT_APP_API_BASE_URL_FOR_FILES=http://localhost:5116 (không có /api/...)
  const filesBaseUrl = process.env.REACT_APP_API_BASE_URL_FOR_FILES || '';


  if (isLoadingProfile && !currentUser) { // Chỉ hiển thị loading toàn trang khi chưa có dữ liệu user ban đầu
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'grey.100' }}>
      <CssBaseline />
      <AppBar
        position="sticky"
        sx={{
          backgroundColor: 'background.paper',
          color: 'text.primary',
          boxShadow: '0px 1px 3px rgba(0,0,0,0.1)', // Shadow nhẹ hơn một chút
        }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ justifyContent: 'space-between', minHeight: { xs: 56, sm: 64 } }}>
            {/* IconButton cho Menu trên mobile (nếu bạn muốn phát triển sau) */}
            {/* <IconButton color="inherit" aria-label="open drawer" edge="start" onClick={handleDrawerToggle} sx={{ mr: 2, display: { md: 'none' } }}> <MenuIcon /> </IconButton> */}
            <AppLogo />
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Tooltip title="Tài khoản">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0, mr: 0.5 }}> {/* Giảm mr của IconButton */}
                  <Avatar
                    sx={{ bgcolor: 'primary.light', width: 32, height: 32, fontSize: '0.875rem' }}
                    // Nối baseURL cho file với avatarUrl
                    src={currentUser?.avatarUrl ? `${filesBaseUrl}${currentUser.avatarUrl}` : undefined}
                    alt={currentUser?.firstName || ''} // Alt nên là string
                  >
                    {(!currentUser?.avatarUrl && currentUser?.firstName) ? currentUser.firstName.charAt(0).toUpperCase() :
                     (!currentUser?.avatarUrl && !currentUser?.firstName && currentUser?.email) ? currentUser.email.charAt(0).toUpperCase() : // Fallback to email initial
                     (!currentUser?.avatarUrl && !currentUser?.firstName && !currentUser?.email) ? <AccountCircleIcon fontSize="small"/> : null}
                  </Avatar>
                </IconButton>
              </Tooltip>
              <Typography variant="body2" sx={{ display: { xs: 'none', md: 'block' }, fontWeight: 500, mr: 0.5 }}> {/* Hiển thị từ md */}
                {currentUser?.firstName && currentUser?.lastName ? `${currentUser.lastName} ${currentUser.firstName}` : (currentUser?.email || 'Người dùng')}
              </Typography>
              <ArrowDropDownIcon sx={{ color: 'text.secondary', cursor: 'pointer', fontSize:'1.2rem' }} onClick={handleOpenUserMenu} />
              <Menu
                sx={{ mt: '40px' }} // Điều chỉnh margin top của menu
                id="menu-appbar-user"
                anchorEl={anchorElUser}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                keepMounted
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
                PaperProps={{
                    elevation: 0,
                    sx: {
                      overflow: 'visible',
                      filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.15))', // Thêm shadow đẹp hơn
                      mt: 1.5,
                      '& .MuiAvatar-root': {
                        width: 32,
                        height: 32,
                        ml: -0.5,
                        mr: 1,
                      },
                      '&:before': { // Tạo mũi tên nhỏ cho menu
                        content: '""',
                        display: 'block',
                        position: 'absolute',
                        top: 0,
                        right: 14,
                        width: 10,
                        height: 10,
                        bgcolor: 'background.paper',
                        transform: 'translateY(-50%) rotate(45deg)',
                        zIndex: 0,
                      },
                    },
                  }}
              >
                <MenuItem onClick={handleGoToProfile} sx={{fontSize: '0.9rem', px:2, py:1}}>
                  Hồ sơ của tôi
                </MenuItem>
                <MenuItem onClick={handleLogoutAndRedirect} sx={{fontSize: '0.9rem', px:2, py:1}}>
                  Đăng xuất
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <Container component="main" maxWidth="lg" sx={{ flexGrow: 1, py: {xs: 2, sm: 2.5, md:3}, mt: {xs: 1, sm: 1.5, md:2} }}> {/* Điều chỉnh padding và margin */}
        <Outlet />
      </Container>
    </Box>
  );
};

export default DashboardLayout;