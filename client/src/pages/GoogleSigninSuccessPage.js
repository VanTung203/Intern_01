// src/pages/GoogleSigninSuccessPage.js
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Box, CircularProgress, Typography } from '@mui/material';

const GoogleSigninSuccessPage = () => {
    const { loginActionFromToken } = useAuth();
    const [searchParams] = useSearchParams();
    const [message, setMessage] = useState("Đang xử lý đăng nhập, vui lòng đợi...");

    useEffect(() => {
        const token = searchParams.get('token');
        const error = searchParams.get('externalLoginStatus');
        const reason = searchParams.get('reason');

        if (error === 'error') {
            const errorMessage = reason ? reason.replace(/_/g, ' ') : 'Lỗi không xác định';
            setMessage(`Đăng nhập thất bại: ${errorMessage}. Đang chuyển hướng về trang đăng nhập...`);
            setTimeout(() => {
                // Điều hướng về login và có thể hiển thị lỗi cho người dùng
                window.location.href = `/login?error=${encodeURIComponent(errorMessage)}`;
            }, 3000);
            return;
        }

        if (token) {
            // Gọi hàm trong AuthContext để xử lý token và điều hướng
            loginActionFromToken(token);
        } else {
             setMessage(`Không tìm thấy token xác thực. Đang chuyển hướng về trang đăng nhập...`);
             setTimeout(() => {
                window.location.href = '/login';
            }, 3000);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]); // Phụ thuộc vào searchParams và loginActionFromToken

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <CircularProgress />
            <Typography sx={{ mt: 2, textAlign: 'center', px: 2 }}>{message}</Typography>
        </Box>
    );
};

export default GoogleSigninSuccessPage;