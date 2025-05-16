// client/src/components/Layout/MainLayout.js
import React from 'react';
import { Outlet, Link as RouterLink } from 'react-router-dom'; // Outlet để render route con, Link để điều hướng
import { AppBar, Toolbar, Typography, Container, Box, Button, Stack } from '@mui/material';

const MainLayout = () => {
  // Giả sử chúng ta sẽ có trạng thái đăng nhập sau này
  const isAuthenticated = false; // Thay đổi giá trị này để test UI

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* AppBar */}
      <AppBar position="static">
        <Container maxWidth="lg"> {/* Hoặc "xl", hoặc false để full width */}
          <Toolbar disableGutters> {/* disableGutters để không có padding mặc định */}
            <Typography
              variant="h6"
              noWrap
              component={RouterLink} // Dùng RouterLink để không reload trang
              to="/"
              sx={{
                mr: 2,
                flexGrow: 1, // Đẩy các nút về bên phải
                fontFamily: 'monospace',
                fontWeight: 700,
                letterSpacing: '.1rem',
                color: 'inherit',
                textDecoration: 'none',
              }}
            >
              IDENTITY APP
            </Typography>

            {/* Navigation Links */}
            <Stack direction="row" spacing={1}>
              <Button color="inherit" component={RouterLink} to="/">
                Home
              </Button>
              {isAuthenticated ? (
                <>
                  <Button color="inherit" component={RouterLink} to="/profile">
                    Profile
                  </Button>
                  <Button color="inherit" /* onClick={handleLogout} */>
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button color="inherit" component={RouterLink} to="/login">
                    Login
                  </Button>
                  <Button color="inherit" component={RouterLink} to="/register">
                    Register
                  </Button>
                </>
              )}
            </Stack>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Main Content Area */}
      <Container component="main" maxWidth="lg" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
        <Outlet /> {/* Đây là nơi các component của route con sẽ được render */}
      </Container>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          mt: 'auto',
          backgroundColor: (theme) =>
            theme.palette.mode === 'light'
              ? theme.palette.grey[200]
              : theme.palette.grey[800],
        }}
      >
        <Container maxWidth="sm">
          <Typography variant="body2" color="text.secondary" align="center">
            {'© '}
            {new Date().getFullYear()}
            {' Identity Server Project. All rights reserved.'}
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default MainLayout;