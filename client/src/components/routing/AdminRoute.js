// client/src/components/routing/AdminRoute.js
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Box, CircularProgress } from '@mui/material';

const AdminRoute = () => {
    const { isAuthenticated, user, isLoading } = useAuth();
    
    // Nếu đang trong quá trình kiểm tra auth, hiển thị loading
    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }
    
    // Kiểm tra đã đăng nhập và có vai trò 'Admin' chưa
    const isAdmin = user?.roles?.includes('Admin');

    return isAuthenticated && isAdmin ? <Outlet /> : <Navigate to="/login" replace />;
};

export default AdminRoute;