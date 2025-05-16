// client/src/services/authService.js
import axios from 'axios';

// 1. ĐỊNH NGHĨA BASE URL CHO API
// Nên lấy từ biến môi trường để linh hoạt giữa các môi trường (development, production)
// Trong Create React App, có thể tạo file .env ở thư mục gốc của client
// và thêm: REACT_APP_API_BASE_URL=http://localhost:5116 (thay port cho đúng)
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5116'; // Port HTTP của backend

// 2. TẠO MỘT AXIOS INSTANCE VỚI CẤU HÌNH CHUNG
const apiClient = axios.create({
  baseURL: API_BASE_URL, // Tất cả request sẽ tự động thêm prefix này
  headers: {
    'Content-Type': 'application/json', // Header mặc định cho request body là JSON
    // có thể thêm các headers mặc định khác ở đây
  },
  // timeout: 10000, // Ví dụ: timeout sau 10 giây (tùy chọn)
});

// 3. Thêm các hàm API

/** 
 * Gửi yêu cầu đăng ký người dùng mới.
 * @param {object} userData - Dữ liệu người dùng (ví dụ: { email, password, firstName, lastName })
 * @returns {Promise<object>} Promise chứa dữ liệu phản hồi từ API.
 */
export const register = async (userData) => {
  try {
    // apiClient sẽ tự động nối '/api/auth/register' với baseURL
    // Ví dụ, nếu baseURL là 'http://localhost:5116', request sẽ đến 'http://localhost:5116/api/auth/register'
    const response = await apiClient.post('/api/auth/register', userData);
    return response.data; // Axios tự động parse JSON response, nên response.data chứa object JavaScript
  } catch (error) {
    // Axios tự động reject promise nếu status code là 4xx hoặc 5xx
    // error.response sẽ chứa thông tin lỗi từ server (bao gồm data, status, headers)
    // error.request sẽ chứa thông tin request nếu request được gửi đi nhưng không nhận được response
    // error.message sẽ là thông báo lỗi chung
    console.error("API Error - Register:", error.response?.data || error.message);
    throw error; // Ném lại lỗi để component có thể bắt và xử lý UI
  }
};

/**
 * Gửi yêu cầu đăng nhập.
 * @param {object} credentials - Dữ liệu đăng nhập (ví dụ: { email, password })
 * @returns {Promise<object>} Promise chứa dữ liệu phản hồi (ví dụ: token).
 */
export const login = async (credentials) => {
  try {
    const response = await apiClient.post('/api/auth/login', credentials);
    if (response.data && response.data.token) {
      // Ví dụ: Lưu token vào localStorage hoặc Context/Redux
      localStorage.setItem('authToken', response.data.token);
      // Cập nhật header mặc định cho các request sau này nếu cần
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
    }
    return response.data;
  } catch (error) {
    console.error("API Error - Login:", error.response?.data || error.message);
    localStorage.removeItem('authToken'); // Xóa token cũ nếu login thất bại
    delete apiClient.defaults.headers.common['Authorization']; // Xóa header auth
    throw error;
  }
};

/**
 * Gửi yêu cầu xác thực email.
 * @param {string} userId
 * @param {string} token
 * @returns {Promise<object>}
 */
export const confirmEmail = async (userId, token) => {
    try {
        // Params sẽ được thêm vào URL: /api/auth/confirmemail?userId=...&token=...
        const response = await apiClient.get('/api/auth/confirmemail', {
            params: { userId, token }
        });
        return response.data || { message: "Yêu cầu xác thực email đã được xử lý." };
    } catch (error) {
        console.error("API Error - Confirm Email:", error.response?.data || error.message);
        throw error;
    }
};


// ... các hàm khác như forgotPassword, resetPassword ...

export const forgotPassword = async (emailData) => {
    try {
        // emailData: { email: "user@example.com" }
        const response = await apiClient.post('/api/auth/forgot-password', emailData);
        return response.data;
    } catch (error) {
        console.error("API Error - Forgot Password:", error.response?.data || error.message);
        throw error;
    }
};

export const resetPassword = async (resetData) => {
    try {
        // resetData: { email, token, newPassword }
        const response = await apiClient.post('/api/auth/reset-password', resetData);
        return response.data;
    } catch (error) {
        console.error("API Error - Reset Password:", error.response?.data || error.message);
        throw error;
    }
};


// Hàm logout
export const logout = () => {
  localStorage.removeItem('authToken');
  delete apiClient.defaults.headers.common['Authorization'];
  // TODO: Gọi API logout ở backend nếu có để vô hiệu hóa token phía server (nếu cần)
  // Ví dụ: await apiClient.post('/api/auth/logout');
  console.log("User logged out, token removed.");
};

// Hàm để set token cho các request sau khi login hoặc lấy từ localStorage khi tải lại trang
export const setAuthHeader = (token) => {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }
};