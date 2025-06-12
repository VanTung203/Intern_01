// client/src/pages/UserProfilePage.js
import React from 'react';
import { Box, Paper, Typography, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Breadcrumbs, Link as MuiLink, useTheme, Avatar } from '@mui/material';
import { Link as RouterLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { alpha } from '@mui/material/styles';

const menuItems = [
    { text: 'Thông tin tài khoản', icon: <PersonOutlineIcon />, path: '/profile/info' },
    { text: 'Bảo mật tài khoản', icon: <SecurityOutlinedIcon />, path: '/profile/security' },
];

// --- AvatarCard Component (ĐÃ SỬA ĐỔI) ---
// Giờ đây component này đơn giản hơn, chỉ hiển thị và nhận sự kiện click
const AvatarCard = ({ avatarUrl, firstName, onAvatarClick }) => {
    const theme = useTheme();

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
                width: '100%',
                cursor: 'pointer', // Thêm con trỏ để báo hiệu có thể click
            }}
            onClick={onAvatarClick} // Sự kiện click được xử lý ở đây
        >
            <Avatar
                src={avatarUrl}
                sx={{
                    width: 120,
                    height: 120,
                    mb: 2.5,
                    fontSize: '2rem', // Tăng kích thước chữ cho rõ hơn
                    border: `2px dashed ${alpha(theme.palette.text.secondary, 0.3)}`,
                }}
            >
                {/* Hiển thị chữ cái đầu của Tên nếu không có avatar */}
                {!avatarUrl && (firstName ? firstName.charAt(0).toUpperCase() : 'T')}
            </Avatar>
            
            {/* ĐÃ XÓA NÚT "TẢI ẢNH" */}
            
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

// --- UserProfilePage Component (ĐÃ SỬA ĐỔI) ---
const UserProfilePage = () => {
    const location = useLocation();
    const theme = useTheme();
    const currentMenuItem = menuItems.find(item => location.pathname.startsWith(item.path)) || menuItems[0];
    const fileInputRef = React.useRef(null);

    // --- Quản lý trạng thái được nâng lên component cha ---
    const [avatarPreview, setAvatarPreview] = React.useState(null);
    const [avatarFile, setAvatarFile] = React.useState(null); // State cho file object
    const [userName, setUserName] = React.useState('');

    // Hàm cập nhật thông tin hiển thị (tên và URL preview) từ form con
    const handleInfoUpdate = (previewUrl, name) => {
        setAvatarPreview(previewUrl);
        setUserName(name);
    };

    // Hàm xử lý khi người dùng chọn file
    const handleFileChange = (event) => {
        const file = event.target.files?.[0];
        if (file) {
            // Kiểm tra kích thước và loại file ở đây để phản hồi nhanh
            if (file.size > 200 * 1024) {
                alert('Lỗi: Kích thước file không được vượt quá 200 KB.');
                return;
            }
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
            if (!allowedTypes.includes(file.type.toLowerCase())) {
                 alert('Lỗi: Định dạng file không hợp lệ. Chỉ chấp nhận .jpeg, .jpg, .png, .gif.');
                return;
            }
            
            // Cập nhật file và preview
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };
    
    // Hàm được gọi khi click vào card avatar
    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    // Hàm để form con reset lại file sau khi upload thành công
    const clearAvatarFile = () => {
        setAvatarFile(null);
        if(fileInputRef.current) {
            fileInputRef.current.value = ""; // Reset input để có thể chọn lại cùng 1 file
        }
    }

    return (
        <Box sx={{width:'100%'}}>
             {/* Thẻ input ẩn để chọn file */}
             <input
                type="file"
                hidden
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".jpeg,.jpg,.png,.gif"
            />
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

            <Box sx={{ display: 'flex', gap: 3}}>
                {/* Sidebar */}
                <Box sx={{ width: { xs: '100%', md: '280px' } }}>
                    <ProfileSidebar />
                </Box>

                {/* Main Content */}
                <Box sx={{ flex: 1, overflowY: 'auto' }}>
                    {location.pathname === '/profile/info' || location.pathname === '/profile' ? (
                        <Box sx={{ display: 'flex', flexWrap: 'nowrap', gap: 3 }}>
                            {/* Avatar Card - chiếm 1/3 */}
                            <Box sx={{ flex: '0 0 300px' }}>
                                <AvatarCard
                                    avatarUrl={avatarPreview}
                                    firstName={userName}
                                    onAvatarClick={handleAvatarClick}
                                />
                            </Box>

                            {/* Form Card - chiếm 2/3 */}
                            <Box sx={{ flex: '1 1 auto' }}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: { xs: 2, sm: 3, md: 6.5 },
                                        borderRadius: '12px',
                                        border: `1px solid ${theme.palette.divider}`,
                                        height: '100%',
                                        maxWidth: '750px'
                                    }}
                                >
                                    {/* Truyền các state và hàm cần thiết cho form con */}
                                    <Outlet context={{ handleInfoUpdate, avatarFile, clearAvatarFile }} />
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