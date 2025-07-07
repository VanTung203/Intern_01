// client/src/pages/admin/UserListPage.js
import React, { useEffect, useState, useCallback } from 'react';
import {
    Box, Typography, CircularProgress, Alert, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Avatar, IconButton, Menu, MenuItem,
    InputAdornment, TextField, Button, Select, FormControl, InputLabel,
    ListItemIcon, ListItemText, Divider
} from '@mui/material';
import { getAllUsers, lockUser, unlockUser, deleteUser } from '../../services/userService';
import UserCreateDialog from '../../components/admin/UserCreateDialog';
import UserDetailsDialog from '../../components/admin/UserDetailsDialog';
import UserResetPasswordDialog from '../../components/admin/UserResetPasswordDialog';
import UserDeleteConfirmDialog from '../../components/admin/UserDeleteConfirmDialog';
import { useAuth } from '../../context/AuthContext';

// Import các icons cần thiết
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import PersonIcon from '@mui/icons-material/Person';
// Import các icons Trạng thái
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DoNotDisturbOnIcon from '@mui/icons-material/DoNotDisturbOn';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import { TablePagination } from '@mui/material';
// Import các icons giao diện Thao tác
import InfoIcon from '@mui/icons-material/Info'; 
import LockResetIcon from '@mui/icons-material/LockReset';            
import DeleteIcon from '@mui/icons-material/Delete';
import Logout from '@mui/icons-material/Logout';

const UserListPage = () => {
    // State cho dữ liệu
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // CÁC STATE CHO TÌM KIẾM, BỘ LỌC
    const [searchTerm, setSearchTerm] = useState(''); // Giá trị đang gõ trong ô input
    const [appliedSearch, setAppliedSearch] = useState(''); // Giá trị đã được áp dụng để tìm kiếm
    const [statusFilter, setStatusFilter] = useState('all');

    // State cho việc tương tác với UI (menu, filter, search, pagination)
    const [anchorEl, setAnchorEl] = useState(null); // Để mở menu thao tác
    const [selectedUser, setSelectedUser] = useState(null); // User đang được chọn
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Stase cho các Dialog 
    const [openCreateDialog, setOpenCreateDialog] = useState(false);
    const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
    const [openResetPasswordDialog, setOpenResetPasswordDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [isSubmittingAction, setIsSubmittingAction] = useState(false);
    const [actionError, setActionError] = useState('');

    // Khai báo các biến và state cần thiết cho các hàm xử lý (handleLogout) và phần giao diện (JSX) cho menu đăng xuất
    const { user, logoutAction } = useAuth();
    const [accountMenuAnchor, setAccountMenuAnchor] = useState(null);
    const isAccountMenuOpen = Boolean(accountMenuAnchor);

    // GỌI API
    // Dùng useCallback để tránh fetchUsers được tạo lại không cần thiết
    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            // Gọi API với 2 từ khóa (tìm kiếm và lọc)
            const data = await getAllUsers(appliedSearch, statusFilter);
            setUsers(data);
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể tải danh sách người dùng.');
        } finally {
            setLoading(false);
        }
    }, [appliedSearch, statusFilter]); // Chỉ chạy lại khi 'appliedSearch' và statusFilter thay đổi

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    // --- Các hàm xử lý sự kiện ---

    // - CÁC HÀM ĐỂ XỬ LÝ SỰ KIỆN TÌM KIẾM -
    // Cập nhật giá trị của ô input khi người dùng đang gõ
    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };
    // Hàm chung để thực hiện hành động tìm kiếm (THÊM MỚI)
    const applySearchFilter = () => {
        setPage(0); // Reset về trang đầu tiên khi tìm kiếm mới
        setAppliedSearch(searchTerm);
    };
    // Bắt sự kiện khi người dùng nhấn Enter.
    const handleSearchKeyDown = (event) => {
        if (event.key === 'Enter') {
            applySearchFilter();
        }
    };
    
    // --- HÀM MỚI ĐỂ XỬ LÝ SỰ KIỆN LỌC TRẠNG THÁI ---
    const handleStatusFilterChange = (event) => {
        setPage(0); // Reset về trang đầu tiên
        setStatusFilter(event.target.value);
    };

    // ----------
    const handleMenuOpen = (event, user) => {
        setAnchorEl(event.currentTarget);
        setSelectedUser(user);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        // setSelectedUser(null);
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

    // --- HÀM XỬ LÝ CHO DIALOG XEM CHI TIẾT ---
    const handleOpenDetailsDialog = () => {
        // `selectedUser` đã được set khi mở menu
        setOpenDetailsDialog(true);
        setAnchorEl(null); // Đóng menu lại
    };
    const handleCloseDetailsDialog = () => {
        setOpenDetailsDialog(false);
        // Reset selectedUser ở đây là tốt nhất, vì dialog chi tiết không còn cần nó nữa
        setSelectedUser(null); 
    };
    const handleOpenResetPasswordDialog = () => {
        setOpenResetPasswordDialog(true);
        setAnchorEl(null); // Đóng menu lại
    };

    const handleCloseResetPasswordDialog = () => {
        setOpenResetPasswordDialog(false);
        setSelectedUser(null);
    };

    // --- HÀM XỬ LÝ CHO DIALOG XÓA --- (MỚI)
    const handleOpenDeleteDialog = () => {
        setOpenDeleteDialog(true);
        setAnchorEl(null); // Đóng menu
    };

    const handleCloseDeleteDialog = () => {
        setOpenDeleteDialog(false);
        setActionError(''); // Xóa lỗi khi đóng
        setSelectedUser(null);
    };

    const handleConfirmDelete = async () => {
        if (!selectedUser) return;

        setIsSubmittingAction(true);
        setActionError('');
        try {
            await deleteUser(selectedUser.id);
            // Cập nhật UI bằng cách lọc ra người dùng đã bị xóa
            setUsers(currentUsers => currentUsers.filter(user => user.id !== selectedUser.id));
            handleCloseDeleteDialog(); // Đóng dialog sau khi thành công
        } catch (error) {
            setActionError(error.response?.data?.message || 'Không thể xóa tài khoản.');
        } finally {
            setIsSubmittingAction(false);
        }
    };


    // --- HÀM XỬ LÝ CHO VIỆC KHÓA/MỞ KHÓA TÀI KHOẢN ---
    const handleToggleLockUser = async () => {
        if (!selectedUser) return;
        
        const isCurrentlyLocked = selectedUser.lockoutEnd && new Date(selectedUser.lockoutEnd) > new Date();
        const action = isCurrentlyLocked ? unlockUser : lockUser;
        const actionName = isCurrentlyLocked ? 'Mở khóa' : 'Khóa';
        
        // Đóng menu trước khi thực hiện hành động
        handleMenuClose();

        try {
            await action(selectedUser.id);
            // Cập nhật lại danh sách user ở client để thấy thay đổi ngay lập tức
            setUsers(currentUsers =>
                currentUsers.map(user => {
                    if (user.id === selectedUser.id) {
                        // Tạo một đối tượng mới với lockoutEnd đã được cập nhật
                        return { 
                            ...user, 
                            lockoutEnd: isCurrentlyLocked ? null : new Date(8640000000000000).toISOString() // Ngày rất xa
                        };
                    }
                    return user;
                })
            );
            // (Tùy chọn) Thêm thông báo thành công ở đây (Snackbar)
            // ví dụ: alert(`${actionName} tài khoản thành công!`);
        } catch (error) {
            // (Tùy chọn) Thêm thông báo lỗi ở đây
            // ví dụ: alert(`Lỗi: Không thể ${actionName} tài khoản.`);
            console.error(error);
        } finally {
            setSelectedUser(null);
        }
    };

    //THÊM CÁC HÀM XỬ LÝ CHO MENU ĐĂNG XUẤT
    const handleAccountMenuOpen = (event) => {
        setAccountMenuAnchor(event.currentTarget);
    };
    const handleAccountMenuClose = () => {
        setAccountMenuAnchor(null);
    };
    const handleLogout = () => {
        handleAccountMenuClose();
        logoutAction();
    };
    const getFullAvatarUrl = (relativePath) => {
      if (!relativePath) return null;
      return `${process.env.REACT_APP_API_BASE_URL_FOR_FILES}${relativePath}`;
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

    // Phân trang giờ đây luôn được thực hiện sau khi backend trả về dữ liệu đã lọc
    const paginatedUsers = users.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);


    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
    }

    if (error) {
        return <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>;
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" component="h1" gutterBottom sx={{ mb: 0 }}>
                    Quản lý Người dùng
                </Typography>
                
                {/* Nút bấm Avatar và Menu đăng xuất */}
                <Box>
                    <IconButton onClick={handleAccountMenuOpen} size="small">
                        <Avatar src={getFullAvatarUrl(user?.avatarUrl)} sx={{ width: 40, height: 40, bgcolor: 'text.primary' }}>
                            <PersonIcon />
                        </Avatar>
                    </IconButton>
                    <Menu
                        anchorEl={accountMenuAnchor}
                        id="account-menu"
                        open={isAccountMenuOpen}
                        onClose={handleAccountMenuClose}
                        onClick={handleAccountMenuClose}
                        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                        PaperProps={{
                            elevation: 0,
                            sx: {
                                overflow: 'visible',
                                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.15))',
                                mt: 1.5,
                                width: 220,
                            },
                        }}
                    >
                        <Box sx={{ my: 1.5, px: 2.5 }}>
                            <Typography variant="subtitle2" noWrap>
                                {user ? `${user.lastName} ${user.firstName}` : ''}
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
                                {user?.email}
                            </Typography>
                        </Box>
                        <Divider />
                        <MenuItem onClick={handleLogout} sx={{ color: 'error.main', mt: 1 }}>
                            <ListItemIcon>
                                <Logout fontSize="small" color="error" />
                            </ListItemIcon>
                            Đăng xuất
                        </MenuItem>
                    </Menu>
                </Box>
            </Box>

            {/* Thanh công cụ tìm kiếm và lọc */}
            <Paper sx={{ p: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <TextField
                    variant="outlined"
                    size="small"
                    placeholder="Email, Số điện thoại"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    onKeyDown={handleSearchKeyDown}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                {/* Bọc icon trong IconButton và thêm onClick */}
                                <IconButton onClick={applySearchFilter} edge="start">
                                    <SearchIcon />
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                    sx={{ width: '18%' }} // Tăng độ rộng một chút
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
                            value={statusFilter}
                            onChange={handleStatusFilterChange}
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
                    rowsPerPageOptions={[5, 10, 20]}
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
                <MenuItem onClick={handleOpenDetailsDialog}>
                    <ListItemIcon>
                        <InfoIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Xem chi tiết</ListItemText>
                </MenuItem>

                 <MenuItem onClick={handleOpenResetPasswordDialog}>
                    <ListItemIcon>
                        <LockResetIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Đặt lại mật khẩu</ListItemText>
                </MenuItem>

                {selectedUser && (
                    <MenuItem onClick={handleToggleLockUser}>
                        {selectedUser.lockoutEnd && new Date(selectedUser.lockoutEnd) > new Date() ? (
                            <>
                                <ListItemIcon><LockOpenIcon fontSize="small" color="success" /></ListItemIcon>
                                <ListItemText>Mở khóa tài khoản</ListItemText>
                            </>
                        ) : (
                            <>
                                <ListItemIcon><LockIcon fontSize="small" color="warning" /></ListItemIcon>
                                <ListItemText>Khóa tài khoản</ListItemText>
                            </>
                        )}
                    </MenuItem>
                )}

                <MenuItem onClick={handleOpenDeleteDialog} sx={{  }}>
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

            {/* Dialog tạo user */}
            <UserCreateDialog
                open={openCreateDialog}
                onClose={handleCloseCreateDialog}
                onUserCreated={handleUserCreated}
            />

            {/* Dialog xem chi tiết */}
            <UserDetailsDialog
                open={openDetailsDialog}
                onClose={handleCloseDetailsDialog}
                user={selectedUser}
            />

            {/* RENDER DIALOG ĐẶT LẠI MẬT KHẨU */}
            <UserResetPasswordDialog
                open={openResetPasswordDialog}
                onClose={handleCloseResetPasswordDialog}
                user={selectedUser}
            />

            {/* RENDER DIALOG XÁC NHẬN XÓA */}
            <UserDeleteConfirmDialog
                open={openDeleteDialog}
                onClose={handleCloseDeleteDialog}
                onConfirm={handleConfirmDelete}
                user={selectedUser}
                isSubmitting={isSubmittingAction}
                error={actionError}
            />
        </Box>
    );
};

export default UserListPage;