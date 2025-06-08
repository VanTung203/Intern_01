// client/src/pages/admin/UserListPage.js
import React, { useEffect, useState } from 'react';
import {
    Box, Typography, CircularProgress, Alert, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Chip, Avatar, IconButton, Menu, MenuItem,
    InputAdornment, TextField, Button, Select, FormControl, InputLabel,
    ListItemIcon, ListItemText
} from '@mui/material';
import { getAllUsers } from '../../services/userService';
import UserCreateDialog from '../../components/admin/UserCreateDialog';

// Import các icons cần thiết
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
// Import các icons Trạng thái
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DoNotDisturbOnIcon from '@mui/icons-material/DoNotDisturbOn';
import LockIcon from '@mui/icons-material/Lock';
import { TablePagination } from '@mui/material';
// Import các icons giao diện Thao tác
import InfoIcon from '@mui/icons-material/Info'; 
import LockResetIcon from '@mui/icons-material/LockReset';            
import DeleteIcon from '@mui/icons-material/Delete';     

const UserListPage = () => {
    // State cho dữ liệu
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // State cho việc tương tác với UI (menu, filter, search, pagination)
    const [anchorEl, setAnchorEl] = useState(null); // Để mở menu thao tác
    const [selectedUser, setSelectedUser] = useState(null); // User đang được chọn
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // STATE CHO DIALOG
    const [openCreateDialog, setOpenCreateDialog] = useState(false);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                const data = await getAllUsers();
                setUsers(data);
            } catch (err) {
                setError(err.response?.data?.message || 'Không thể tải danh sách người dùng.');
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    // --- Các hàm xử lý sự kiện ---
    const handleMenuOpen = (event, user) => {
        setAnchorEl(event.currentTarget);
        setSelectedUser(user);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedUser(null);
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };
    
    // --- CÁC HÀM ĐỂ XỬ LÝ DIALOG ---
    const handleOpenCreateDialog = () => {
        setOpenCreateDialog(true);
    };

    const handleCloseCreateDialog = () => {
        setOpenCreateDialog(false);
    };

    const handleUserCreated = (newUser) => {
        // Cập nhật danh sách người dùng ở client để không cần gọi lại API
        setUsers(currentUsers => [newUser, ...currentUsers]);
        // (Tùy chọn) Có thể thêm thông báo thành công ở đây (Snackbar)
    };

    // --- Các hàm render phụ ---
    const renderStatus = (user) => {
        if (user.lockoutEnd && new Date(user.lockoutEnd) > new Date()) {
            // Trạng thái bị khóa: chỉ hiển thị icon ổ khóa màu đỏ
            return (
                <Box display="flex">
                    <LockIcon sx={{ color: 'error.main', fontSize: '1.5rem' }} />
                </Box>
            );
        }
        if (user.emailConfirmed) {
            // Trạng thái đã xác thực: chỉ hiển thị icon dấu tích màu xanh lá
            return (
                <Box display="flex">
                    <CheckCircleIcon sx={{ color: 'success.main', fontSize: '1.5rem' }} />
                </Box>
            );
        }
        // Trạng thái chưa xác thực (mặc định): chỉ hiển thị icon dấu trừ trong vòng tròn màu vàng
        return (
            <Box display="flex">
                <DoNotDisturbOnIcon sx={{ color: '', fontSize: '1.5rem' }} />
            </Box>
        );
    };

    // Slice data cho phân trang
    const paginatedUsers = users.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);


    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
    }

    if (error) {
        return <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>;
    }

    return (
        <Box sx={{ }}>
            {/* Breadcrumbs - Phần này có thể thêm sau nếu cần layout phức tạp hơn */}
            <Typography variant="h6" gutterBottom>
                Quản lý Người dùng
            </Typography>

            {/* Thanh công cụ tìm kiếm và lọc */}
            <Paper sx={{ p: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <TextField
                    variant="outlined"
                    size="small"
                    placeholder="Email, Số điện thoại"
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                    sx={{ width: '18%' }}
                />
                <Box>
                    <Button 
                        variant="contained"
                        onClick={handleOpenCreateDialog}
                        sx={{
                            height: 40,
                            mr: 90,
                            backgroundColor: '#212B36', // 800: '#212B36'
                            color: 'white', // Màu chữ trắng
                            fontSize: '0.85rem',
                            '&:hover': {
                                backgroundColor: '#454F5B', // Màu đậm hơn khi hover  
                            },
                        }}
                        startIcon={<AddIcon />}>
                        Thêm tài khoản mới
                    </Button>
                    <FormControl size="small" sx={{minWidth: 200, mr: 2}}>
                        <InputLabel>Trạng thái</InputLabel>
                        <Select
                            label="Trạng thái"
                            defaultValue="all"
                        >
                            <MenuItem value="all">Tất cả</MenuItem>
                            <MenuItem value="active">Đã xác thực</MenuItem>
                            <MenuItem value="inactive">Chưa xác thực</MenuItem>
                            <MenuItem value="locked">Bị khóa</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
            </Paper>

            {/* Bảng danh sách người dùng */}
            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="user table">
                    <TableHead style={{ backgroundColor: '#F4F6F8' }}> {/* Màu nền cho phần đầu bảng */}
                        <TableRow>
                            <TableCell variant="h5" sx={{ fontWeight: 700, mb: 0.75, color: 'text.secondary' }} >Email</TableCell>
                            <TableCell variant="h5" sx={{ fontWeight: 700, mb: 0.75, color: 'text.secondary' }} >Số điện thoại</TableCell>
                            <TableCell variant="h5" sx={{ fontWeight: 700, mb: 0.75, color: 'text.secondary' }} >Trạng thái</TableCell>
                            <TableCell variant="h5" sx={{ fontWeight: 700, mb: 0.75, color: 'text.secondary' }} align="right">Thao tác</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedUsers.map((user) => (
                            <TableRow key={user.id} hover>
                                <TableCell 
                                    sx={{ 
                                        width: '450px',
                                        }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Avatar src={user.avatarUrl} sx={{ mr: 1, width: 35, height: 35 }}>
                                            {user.email.charAt(0).toUpperCase()}
                                        </Avatar>
                                        <Box>
                                            {/* <Typography variant="body2" fontWeight="bold">
                                                {`${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Chưa cập nhật'}
                                            </Typography> */}
                                            <Typography variant="body3" color="text.primary">
                                                {user.email}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </TableCell>
                                <TableCell sx={{ width: '450px' }} >{user.phoneNumber || ''}</TableCell>
                                <TableCell sx={{ width: '400px' }} >{renderStatus(user)}</TableCell>
                                <TableCell align="right">
                                    <IconButton onClick={(e) => handleMenuOpen(e, user)}>
                                        <MoreVertIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                 <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={users.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="Rows:"
                />
            </TableContainer>

            {/* Menu cho nút 3 chấm */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
            >
                <MenuItem onClick={handleMenuClose}>
                    <ListItemIcon>
                        <InfoIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Xem chi tiết</ListItemText>
                </MenuItem>

                 <MenuItem onClick={handleMenuClose}>
                    <ListItemIcon>
                        <LockResetIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Đặt lại mật khẩu</ListItemText>
                </MenuItem>

                <MenuItem onClick={handleMenuClose}>
                    <ListItemIcon>
                        <LockIcon fontSize="small" color="warning" />
                    </ListItemIcon>
                    <ListItemText>Khóa tài khoản</ListItemText>
                </MenuItem>

                <MenuItem onClick={handleMenuClose} sx={{  }}>
                    <ListItemIcon>
                        <DeleteIcon fontSize="small" color="error" /> {/* Icon màu đỏ */}
                    </ListItemIcon>
                    <ListItemText 
                        sx={{
                            '& .MuiListItemText-primary': { // Class mặc định cho văn bản chính trong ListItemText
                            color: 'error.main', // Sử dụng màu đỏ từ theme
                            },
                        }}>
                        Xóa tài khoản </ListItemText>
                </MenuItem>
            </Menu>

            {/* --- RENDER DIALOG MỚI --- */}
            <UserCreateDialog
                open={openCreateDialog}
                onClose={handleCloseCreateDialog}
                onUserCreated={handleUserCreated}
            />
        </Box>
    );
};

export default UserListPage;