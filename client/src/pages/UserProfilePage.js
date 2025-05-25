// client/src/pages/UserProfilePage.js
import React from 'react';
import { Box, Grid, Paper, Typography, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Breadcrumbs, Link as MuiLink, useTheme, Avatar, Button } from '@mui/material'; // Thêm Avatar, Button
import { Link as RouterLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import VpnKeyOutlinedIcon from '@mui/icons-material/VpnKeyOutlined';
// import HomeIcon from '@mui/icons-material/Home'; // Bỏ HomeIcon
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined'; // Icon người dùng mới cho breadcrumbs
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { alpha } from '@mui/material/styles';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera'; // Cho nút tải ảnh
// Giả sử lấy thông tin user từ context hoặc props
// import { useAuth } from '../contexts/AuthContext'; // Ví dụ

const menuItems = [
    { text: 'Thông tin tài khoản', icon: <PersonOutlineIcon />, path: '/profile/info' },
    { text: 'Bảo mật tài khoản', icon: <VpnKeyOutlinedIcon />, path: '/profile/security' },
];

// Component Avatar Card
// Component này sẽ cần props từ UserProfileInfoForm hoặc một state chung
// Tạm thời để placeholder
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
                p: { xs: 2, sm: 3 },
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center', // Để căn giữa nếu chiều cao lớn
                borderRadius: '12px',
                border: `1px dashed ${theme.palette.divider}`, // Viền đứt nét
                height: '100%', // Để card avatar và card form có chiều cao bằng nhau
                minHeight: 300, // Đặt chiều cao tối thiểu
            }}
        >
            <Avatar
                src={avatarUrl} // Sẽ nhận từ state/props
                sx={{
                    width: 120,
                    height: 120,
                    mb: 2.5,
                    fontSize: '1rem', // Cho chữ placeholder 'a'
                    border: `2px dashed ${alpha(theme.palette.text.secondary, 0.3)}` // Viền đứt nét quanh avatar
                }}
                onClick={handleAvatarClick} // Cho phép click để tải ảnh
                style={{ cursor: 'pointer' }}
            >
                {/* {!avatarUrl && firstName ? firstName.charAt(0).toUpperCase() : 'A'}  */}
                a 
            </Avatar>
            {/* Nút tải ảnh có thể bỏ nếu click vào avatar là đủ */}
            { <Button
                variant="outlined"
                component="label"
                size="small"
                startIcon={<PhotoCameraIcon sx={{fontSize: '1rem'}}/>}
                sx={{textTransform:'none', fontSize:'0.8rem', color:'text.primary', borderColor:'grey.400', mt:1}}
            >
                Tải ảnh
                <input type="file" hidden accept=".jpeg,.jpg,.png,.gif" onChange={onFileSelect} ref={fileInputRef}/>
            </Button> }
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, textAlign: 'center', fontSize: '0.75rem' }}>
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
        <Paper elevation={0} sx={{ height: '100%', borderRadius: '12px', p: 1.5, backgroundColor: theme.palette.background.paper /* Nền trắng cho sidebar */, border: `1px solid ${theme.palette.divider}` }}>
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
                                    // THAY ĐỔI MÀU SẮC THEO MẪU
                                    color: isActive ? theme.palette.primary.main : theme.palette.text.secondary,
                                    backgroundColor: isActive ? alpha(theme.palette.primary.main, 0.1) : 'transparent', // Màu nền nhạt hơn
                                    '&:hover': {
                                        backgroundColor: isActive ? alpha(theme.palette.primary.main, 0.15) : alpha(theme.palette.text.primary, 0.04),
                                    },
                                    '& .MuiListItemIcon-root': {
                                        minWidth: 32,
                                        // THAY ĐỔI MÀU ICON THEO MẪU
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

  // State cho avatar, sẽ được truyền xuống AvatarCard và UserProfileInfoForm (qua Outlet context)
  // Hoặc UserProfileInfoForm tự quản lý và truyền lên qua callback
  // Tạm thời để UserProfileInfoForm tự quản lý avatar, AvatarCard chỉ là hiển thị.
  // Bạn sẽ cần cách để AvatarCard lấy được avatarUrl và firstName
  // const { user } = useAuth(); // Ví dụ nếu bạn có user context

  // Placeholder cho avatarUrl và onFileSelect, bạn cần lấy thông tin này từ state hoặc context
  const [avatarPreviewForCard, setAvatarPreviewForCard] = React.useState(null);
  const [firstNameForCard, setFirstNameForCard] = React.useState('');

  const handleAvatarUpdate = (previewUrl, name) => {
      setAvatarPreviewForCard(previewUrl);
      setFirstNameForCard(name);
  };


  return (
    <Box>
        {/* Breadcrumbs - CHỈNH SỬA */}
        <Breadcrumbs aria-label="breadcrumb" separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 3, fontSize: '0.875rem' }}>
            <MuiLink
                component={RouterLink}
                underline="hover"
                // THAY ĐỔI MÀU SẮC VÀ ICON
                color="primary.main" // Màu xanh
                to="/" // Hoặc một trang user dashboard khác
                sx={{display: 'flex', alignItems:'center', fontWeight: 500}}
            >
                <AccountCircleOutlinedIcon sx={{ mr: 0.5, fontSize: '1.1rem' }} /> {/* Icon người dùng */}
                Người dùng
            </MuiLink>
            <Typography color="text.primary" sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
                {currentMenuItem.text}
            </Typography>
        </Breadcrumbs>

        {/* Layout chính: Sidebar | (Avatar Card + Form Card) */}
        <Grid container spacing={3}>
            {/* Cột Sidebar */}
            <Grid item xs={12} md={3}>
                <ProfileSidebar />
            </Grid>

            {/* Cột nội dung chính */}
            <Grid item xs={12} md={9}>
                {/* Nếu là trang thông tin tài khoản thì hiển thị layout 2 card */}
                {location.pathname === '/profile/info' || location.pathname === '/profile' ? (
                    <Grid container spacing={3}>
                        {/* Card Avatar */}
                        <Grid item xs={12} lg={4}>
                            <AvatarCard
                                // avatarUrl={user?.avatarUrl} // Lấy từ context/state
                                // firstName={user?.firstName} // Lấy từ context/state
                                // onFileSelect={(file) => {/* logic tải file sẽ ở UserProfileInfoForm */}}
                                avatarUrl={avatarPreviewForCard} // Truyền state từ UserProfilePage
                                firstName={firstNameForCard}    // Truyền state từ UserProfilePage
                            />
                        </Grid>
                        {/* Card Form */}
                        <Grid item xs={12} lg={8}>
                            <Paper elevation={0} sx={{ p: { xs: 2, sm: 3, md: 3.5 }, borderRadius: '12px', height: '100%', border: `1px solid ${theme.palette.divider}`}}>
                                {/* Truyền callback vào Outlet để UserProfileInfoForm có thể cập nhật AvatarCard */}
                                <Outlet context={{ handleAvatarUpdate }} />
                            </Paper>
                        </Grid>
                    </Grid>
                ) : (
                    // Nếu là trang bảo mật hoặc trang khác, chỉ render Outlet trong 1 card
                    <Paper elevation={0} sx={{ p: { xs: 2, sm: 3, md: 3.5 }, borderRadius: '12px', height: '100%', border: `1px solid ${theme.palette.divider}`}}>
                        <Outlet />
                    </Paper>
                )}
            </Grid>
        </Grid>
    </Box>
  );
};

export default UserProfilePage;