// client/src/pages/UserProfilePage.js
import React from 'react';
import { Box, Paper, Typography, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Breadcrumbs, Link as MuiLink, useTheme, Avatar, Button } from '@mui/material';
import { Link as RouterLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { alpha } from '@mui/material/styles';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';

const menuItems = [
    { text: 'Thông tin tài khoản', icon: <PersonOutlineIcon />, path: '/profile/info' },
    { text: 'Bảo mật tài khoản', icon: <SecurityOutlinedIcon />, path: '/profile/security' },
];

// Component Avatar Card
const AvatarCard = ({ avatarUrl, firstName, onFileSelect }) => {
    const theme = useTheme();
    const fileInputRef = React.useRef(null);

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <Paper
            elevation={0}
            sx={{
                p: 4,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '12px',
                border: `1px dashed ${theme.palette.divider}`,
                height: '100%',
                minHeight: 300,
                width: '100%'
            }}
        >
            <Avatar
                src={avatarUrl}
                sx={{
                    width: 120,
                    height: 120,
                    mb: 2.5,
                    fontSize: '1rem',
                    border: `2px dashed ${alpha(theme.palette.text.secondary, 0.3)}`,
                    cursor: 'pointer',
                }}
                onClick={handleAvatarClick}
            >
                {!avatarUrl && (firstName ? firstName.charAt(0).toUpperCase() : 'a')}
            </Avatar>
            
            <Button
                variant="outlined"
                component="label"
                size="small"
                startIcon={<PhotoCameraIcon sx={{fontSize: '1rem'}}/>}
                sx={{
                    textTransform:'none', 
                    fontSize:'0.8rem', 
                    color:'text.primary', 
                    borderColor:'grey.400',
                    mt: 1
                }}
                onClick={handleAvatarClick}
            >
                Tải ảnh
                <input 
                    type="file" 
                    hidden 
                    accept=".jpeg,.jpg,.png,.gif" 
                    onChange={onFileSelect} 
                    ref={fileInputRef}
                />
            </Button>
            
            <Typography 
                variant="caption" 
                color="text.secondary" 
                sx={{ 
                    mt: 1.5, 
                    textAlign: 'center', 
                    fontSize: '0.75rem'
                }}
            >
                *.jpeg, *.jpg, *.png, *.gif
                <br />
                kích thước tối đa 200 Kb
            </Typography>
        </Paper>
    );
};

const ProfileSidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const theme = useTheme();

    return (
        <Paper 
            elevation={0} 
            sx={{ 
                height: '100%', 
                borderRadius: '12px', 
                p: 1.5, 
                backgroundColor: theme.palette.background.paper, 
                border: `1px solid ${theme.palette.divider}` 
            }}
        >
            <List sx={{ p: 0 }}>
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path || (location.pathname === '/profile' && item.path === '/profile/info');
                    return (
                        <ListItem key={item.text} disablePadding sx={{ mb: 0.75 }}>
                            <ListItemButton
                                selected={isActive}
                                onClick={() => navigate(item.path)}
                                sx={{
                                    borderRadius: '8px',
                                    py: 1.15,
                                    px: 1.5,
                                    color: isActive ? theme.palette.primary.main : theme.palette.text.secondary,
                                    backgroundColor: isActive ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                                    '&:hover': {
                                        backgroundColor: isActive ? alpha(theme.palette.primary.main, 0.15) : alpha(theme.palette.text.primary, 0.04),
                                    },
                                    '& .MuiListItemIcon-root': {
                                        minWidth: 32,
                                        color: isActive ? theme.palette.primary.main : theme.palette.text.secondary,
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
    const theme = useTheme();
    const currentMenuItem = menuItems.find(item => location.pathname.startsWith(item.path)) || menuItems[0];

    const [avatarPreviewForCard, setAvatarPreviewForCard] = React.useState(null);
    const [firstNameForCard, setFirstNameForCard] = React.useState('');

    const handleAvatarUpdate = (previewUrl, name) => {
        setAvatarPreviewForCard(previewUrl);
        setFirstNameForCard(name);
    };

    return (
        <Box sx={{width:'100%'}}>
            {/* Breadcrumbs */}
            <Breadcrumbs 
                aria-label="breadcrumb" 
                separator={<NavigateNextIcon fontSize="small" />} 
                sx={{ mb: 3, fontSize: '0.875rem' }}
            >
                <MuiLink
                    component={RouterLink}
                    underline="hover"
                    color="primary.main"
                    to="/"
                    sx={{display: 'flex', alignItems:'center', fontWeight: 500}}
                >
                    <AccountCircleOutlinedIcon sx={{ mr: 0.5, fontSize: '1.1rem' }} />
                    Người dùng
                </MuiLink>
                <Typography color="text.primary" sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
                    {currentMenuItem.text}
                </Typography>
            </Breadcrumbs>

            <Box sx={{ display: 'flex'}}>
                {/* Sidebar - chiếm 3/12 = 25% chiều rộng */}
                <Box sx={{ width: { xs: '100%', md: '25%' }, borderRight: '1px solid #e0e0e0' }}>
                    <ProfileSidebar />
                </Box>

                {/* Main Content - chiếm 75% */}
                <Box sx={{ flex: 1, p: { xs: 2, sm: 3, md: 4 }, overflowY: 'auto' }}>
                    {location.pathname === '/profile/info' || location.pathname === '/profile' ? (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                            {/* Avatar Card - chiếm 1/3 */}
                            <Box sx={{ flex: { xs: '100%', lg: '1 1 30%' }, display: 'flex', width:'10%' }}>
                                <AvatarCard
                                    avatarUrl={avatarPreviewForCard}
                                    firstName={firstNameForCard}
                                />
                            </Box>

                            {/* Form Card - chiếm 2/3 */}
                            <Box sx={{ flex: { xs: '100%', lg: '1 1 65%' }, display: 'flex', width:'140%'  }}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: { xs: 2, sm: 3, md: 3.5 },
                                        borderRadius: '12px',
                                        border: `1px solid ${theme.palette.divider}`,
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        width:'140%'
                                    }}
                                >
                                    <Outlet context={{ handleAvatarUpdate }} />
                                </Paper>
                            </Box>
                        </Box>
                    ) : (
                        <Paper
                            elevation={0}
                            sx={{
                                p: { xs: 2, sm: 3, md: 3.5 },
                                borderRadius: '12px',
                                height: '100%',
                                border: `1px solid ${theme.palette.divider}`,
                                display: 'flex',
                                flexDirection: 'column',
                            }}
                        >
                            <Outlet />
                        </Paper>
                    )}
                </Box>
            </Box>
        </Box>
    );
};

export default UserProfilePage;