// client/src/pages/admin/UserListPage.js
import React, { useEffect, useState } from 'react';
import { 
    Box, Typography, CircularProgress, Alert, Paper,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip
} from '@mui/material';
import { getAllUsers } from '../../services/userService';

const UserListPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

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

    const getStatusChip = (user) => {
        if (user.lockoutEnd && new Date(user.lockoutEnd) > new Date()) {
            return <Chip label="Bị khóa" color="error" size="small" />;
        }
        if (user.emailConfirmed) {
            return <Chip label="Hoạt động" color="success" size="small" />;
        }
        return <Chip label="Chờ xác thực" color="warning" size="small" />;
    };

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
    }

    if (error) {
        return <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>;
    }

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Quản lý Người dùng
            </Typography>
            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            <TableCell>Email</TableCell>
                            <TableCell>Họ và Tên</TableCell>
                            <TableCell>Vai trò</TableCell>
                            <TableCell>Trạng thái</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell component="th" scope="row">{user.email}</TableCell>
                                <TableCell>{`${user.firstName || ''} ${user.lastName || ''}`.trim()}</TableCell>
                                <TableCell>
                                    {user.roles?.map(role => (
                                        <Chip 
                                            key={role}
                                            label={role}
                                            color={role === 'Admin' ? 'primary' : 'default'}
                                            size="small" 
                                            sx={{ mr: 0.5 }}
                                        />
                                    ))}
                                </TableCell>
                                <TableCell>{getStatusChip(user)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default UserListPage;