// client/src/pages/admin/UserListPage.js
import React, { useEffect, useState } from 'react';
import {
    Box, Typography, CircularProgress, Alert, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Chip, Avatar, IconButton, Menu, MenuItem,
    InputAdornment, TextField, Button, Select, FormControl, InputLabel
} from '@mui/material';
import { getAllUsers } from '../../services/userService';

// Import các icons cần thiết
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import LockIcon from '@mui/icons-material/Lock';
import { TablePagination } from '@mui/material';


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
    
    // --- Các hàm render phụ ---
    const renderStatus = (user) => {
        if (user.lockoutEnd && new Date(user.lockoutEnd) > new Date()) {
            return <Chip icon={<LockIcon />} label="Bị khóa" color="error" size="small" variant="outlined"/>;
        }
        if (user.emailConfirmed) {
            return <Chip icon={<CheckCircleIcon />} label="Đã xác thực" color="success" size="small" variant="outlined"/>;
        }
        return <Chip icon={<CancelIcon />} label="Chưa xác thực" color="warning" size="small" variant="outlined"/>;
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
        <Box sx={{ p: 1 }}>
            {/* Breadcrumbs - Phần này có thể thêm sau nếu cần layout phức tạp hơn */}
            <Typography variant="h6" gutterBottom>
                Quản lý Người dùng
            </Typography>

            {/* Thanh công cụ tìm kiếm và lọc */}
            <Paper sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
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
                    <Button variant="contained" startIcon={<AddIcon />}>
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
                    <TableHead>
                        <TableRow>
                            <TableCell>Email</TableCell>
                            <TableCell>Số điện thoại</TableCell>
                            <TableCell>Trạng thái</TableCell>
                            <TableCell align="right">Thao tác</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedUsers.map((user) => (
                            <TableRow key={user.id} hover>
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Avatar src={user.avatarUrl} sx={{ mr: 2, width: 40, height: 40 }}>
                                            {user.email.charAt(0).toUpperCase()}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="body2" fontWeight="bold">
                                                {`${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Chưa cập nhật'}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {user.email}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </TableCell>
                                <TableCell>{user.phoneNumber || 'Chưa cập nhật'}</TableCell>
                                <TableCell>{renderStatus(user)}</TableCell>
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
                    labelRowsPerPage="Số hàng mỗi trang:"
                />
            </TableContainer>

            {/* Menu cho nút 3 chấm */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
            >
                <MenuItem onClick={handleMenuClose}>Xem chi tiết</MenuItem>
                <MenuItem onClick={handleMenuClose}>Đặt lại mật khẩu</MenuItem>
                <MenuItem onClick={handleMenuClose}>Khóa tài khoản</MenuItem>
                <MenuItem onClick={handleMenuClose} sx={{ color: 'error.main' }}>Xóa tài khoản</MenuItem>
            </Menu>
        </Box>
    );
};

export default UserListPage;