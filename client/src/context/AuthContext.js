// client/src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { setGlobalAuthHeader } from '../api/apiClient';
import { getUserProfile } from '../services/userService';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true); // Quan trọng: dùng để xử lý lần tải đầu tiên
    const navigate = useNavigate(); 

    useEffect(() => {
        // Kiểm tra trạng thái đăng nhập khi ứng dụng khởi động
        const checkAuthStatus = async () => {
            const token = localStorage.getItem('authToken');
            if (token) {
                setGlobalAuthHeader(token);
                try {
                    // Lấy thông tin user từ token để xác nhận token còn hợp lệ
                    const profileData = await getUserProfile(); 
                    setUser(profileData);
                    setIsAuthenticated(true);
                } catch (error) {
                    // Token không hợp lệ (hết hạn, bị thu hồi, ...)
                    console.error("Auth check failed:", error);
                    localStorage.removeItem('authToken');
                    setGlobalAuthHeader(null);
                    setUser(null);
                    setIsAuthenticated(false);
                }
            }
            setIsLoading(false); // Hoàn tất kiểm tra
        };
        checkAuthStatus();
    }, []);

    // Hàm loginAction sẽ được gọi từ LoginForm sau khi API trả về thành công
    const loginAction = (data) => {
        const { token, user: userData } = data;
        localStorage.setItem('authToken', token);
        setGlobalAuthHeader(token);
        setUser(userData);
        setIsAuthenticated(true);

        // LOGIC ĐIỀU HƯỚNG TẬP TRUNG
        if (userData.roles?.includes('Admin')) {
            navigate('/admin/users', { replace: true });
        } else {
            navigate('/profile/info', { replace: true });
        }
    };

    // >>> START: THÊM HÀM MỚI <<<
    // Hàm này được gọi từ trang callback, chỉ nhận token
    const loginActionFromToken = (token) => {
        // 1. Lưu token và thiết lập header
        localStorage.setItem('authToken', token);
        setGlobalAuthHeader(token);

        // 2. Giải mã token để lấy thông tin user cơ bản
        const decodedToken = jwtDecode(token);
        const userData = {
            id: decodedToken.nameid,
            email: decodedToken.email,
            userName: decodedToken.unique_name,
            firstName: decodedToken.given_name || '',
            lastName: decodedToken.family_name || '',
            roles: decodedToken.role || [], // Đảm bảo roles là một mảng
        };

        // 3. Cập nhật state
        setUser(userData);
        setIsAuthenticated(true);
        setIsLoading(false); // Quan trọng: dừng trạng thái loading

        // 4. Điều hướng
        const rolesArray = Array.isArray(userData.roles) ? userData.roles : [userData.roles];
        if (rolesArray.includes('Admin')) {
            navigate('/admin/users', { replace: true });
        } else {
            navigate('/profile/info', { replace: true });
        }
    };
    // >>> END: THÊM HÀM MỚI <<<

    const logoutAction = () => {
        localStorage.removeItem('authToken');
        setGlobalAuthHeader(null);
        setUser(null);
        setIsAuthenticated(false);
        navigate('/login', { replace: true }); // Điều hướng về trang login sau khi logout
    };

    const authContextValue = {
        user,
        isAuthenticated,
        isLoading,
        loginAction,
        logoutAction,
        loginActionFromToken
    };

    return (
        <AuthContext.Provider value={authContextValue}>
            {children}
        </AuthContext.Provider>
    );
};