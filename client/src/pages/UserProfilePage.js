// client/src/pages/UserProfilePage.js
import React from 'react';
import { Box, Grid, Paper, Typography, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Breadcrumbs, Link as MuiLink, useTheme } from '@mui/material';
import { Link as RouterLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import VpnKeyOutlinedIcon from '@mui/icons-material/VpnKeyOutlined';
import HomeIcon from '@mui/icons-material/Home'; // Cho breadcrumbs
import NavigateNextIcon from '@mui/icons-material/NavigateNext'; // Cho breadcrumbs
import { alpha } from '@mui/material/styles'; // Cho màu selected


const menuItems = [
    { text: 'Thông tin tài khoản', icon: <PersonOutlineIcon />, path: '/profile/info' },
    { text: 'Bảo mật tài khoản', icon: <VpnKeyOutlinedIcon />, path: '/profile/security' },
];

const ProfileSidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const theme = useTheme();

    return (
        <Paper elevation={0} sx={{ height: '100%', borderRadius: '12px', p: 1.5, border: `1px solid ${theme.palette.divider}` }}>
            {/* Có thể thêm Avatar và Tên người dùng ở đây nếu muốn */}
            <List sx={{ p: 0 }}>
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path || (location.pathname === '/profile' && item.path === '/profile/info');
                    return (
                        <ListItem key={item.text} disablePadding sx={{ mb: 0.75 }}>
                            <ListItemButton
                                selected={isActive}
                                onClick={() => navigate(item.path)}
                                sx={{
                                    borderRadius: '8px', // Bo tròn
                                    py: 1.15,
                                    px: 1.5,
                                    color: isActive ? theme.palette.primary.main : theme.palette.text.secondary,
                                    backgroundColor: isActive ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
                                    '&:hover': {
                                        backgroundColor: isActive ? alpha(theme.palette.primary.main, 0.12) : alpha(theme.palette.text.primary, 0.04),
                                    },
                                    '& .MuiListItemIcon-root': {
                                        color: isActive ? theme.palette.primary.main : theme.palette.text.secondary,
                                        minWidth: 32,
                                    },
                                    '& .MuiListItemText-primary': {
                                        fontWeight: isActive ? 600 : 500,
                                        fontSize: '0.9rem',
                                    }
                                }}
                            >
                                <ListItemIcon>
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText primary={item.text} />
                            </ListItemButton>
                        </ListItem>
                    );
                })}
            </List>
        </Paper>
    );
};

const UserProfilePage = () => {
  const location = useLocation();
  const currentMenuItem = menuItems.find(item => location.pathname.startsWith(item.path)) || menuItems[0]; // Mặc định là item đầu tiên

  return (
    <Box>
        {/* Breadcrumbs */}
        <Breadcrumbs aria-label="breadcrumb" separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 2.5, fontSize: '0.875rem' }}>
            <MuiLink component={RouterLink} underline="hover" color="inherit" to="/" sx={{display: 'flex', alignItems:'center'}}>
                <HomeIcon sx={{ mr: 0.5, fontSize: 'inherit' }} />
                Người dùng
            </MuiLink>
            <Typography color="text.primary" sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
                {currentMenuItem.text}
            </Typography>
        </Breadcrumbs>

        <Grid container spacing={3}>
            <Grid item xs={12} md={3}> {/* Cột Sidebar */}
                <ProfileSidebar />
            </Grid>
            <Grid item xs={12} md={9}> {/* Cột Nội dung chính */}
                <Paper elevation={0} sx={{ p: { xs: 2, sm: 3, md: 3.5 }, borderRadius: '12px', height: '100%', border: (theme) => `1px solid ${theme.palette.divider}`}}>
                    <Outlet /> {/* Render UserProfileInfoForm hoặc UserSecurityContent */}
                </Paper>
            </Grid>
        </Grid>
    </Box>
  );
};

export default UserProfilePage;