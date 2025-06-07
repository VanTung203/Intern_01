// client/src/services/authService.js
import apiClient, { setGlobalAuthHeader } from '../api/apiClient'; // Import instance chung và hàm set header

/**
 * Gửi yêu cầu đăng ký người dùng mới.
 * @param {object} userData - Dữ liệu người dùng (ví dụ: { email, password, firstName, lastName })
 * @returns {Promise<object>} Promise chứa dữ liệu phản hồi từ API.
 */
export const register = async (userData) => {
  try {
    const response = await apiClient.post('/api/auth/register', userData);
    return response.data;
  } catch (error) {
    // Interceptor trong apiClient.js có thể đã log lỗi, ở đây chỉ cần ném lại
    // Hoặc có thể thêm log cụ thể cho từng hàm nếu muốn
    console.error("API Error - Register in authService:", error.response?.data || error.message);
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
        const response = await apiClient.get('/api/auth/confirmemail', {
            params: { userId, token }
        });
        return response.data || { message: "Yêu cầu xác thực email đã được xử lý." };
    } catch (error) {
        console.error("API Error - Confirm Email in authService:", error.response?.data || error.message);
        throw error;
    }
};

/**
 * Gửi yêu cầu quên mật khẩu.
 * @param {object} emailData - Đối tượng chứa email (ví dụ: { email: "user@example.com" })
 * @returns {Promise<object>}
 */
export const forgotPassword = async (emailData) => {
    try {
        const response = await apiClient.post('/api/auth/forgot-password', emailData);
        return response.data;
    } catch (error) {
        console.error("API Error - Forgot Password in authService:", error.response?.data || error.message);
        throw error;
    }
};

/**
 * Gửi yêu cầu đặt lại mật khẩu.
 * @param {object} resetData - Đối tượng chứa email, token, newPassword
 * @returns {Promise<object>}
 */
export const resetPassword = async (resetData) => {
    try {
        const response = await apiClient.post('/api/auth/reset-password', resetData);
        return response.data;
    } catch (error) {
        console.error("API Error - Reset Password in authService:", error.response?.data || error.message);
        throw error;
    }
};

/**
 * Gửi yêu cầu đăng nhập.
 * @param {object} credentials - Dữ liệu đăng nhập
 * @returns {Promise<object>} Promise chứa dữ liệu phản hồi (bao gồm token, user, requiresTwoFactor)
 */
export const login = async (credentials) => {
  try {
    const response = await apiClient.post('/api/auth/login', credentials);
    // Chỉ cần trả về dữ liệu. KHÔNG xử lý localStorage hay header ở đây nữa.
    return response.data; 
  } catch (error) {
    console.error("API Error - Login in authService:", error.response?.data || error.message);
    // Không cần xóa token ở đây nữa vì service không set token
    throw error;
  }
};

/**
 * Gửi yêu cầu xác thực OTP 2FA.
 * @param {string} email
 * @param {string} otpCode
 * @returns {Promise<object>} Promise chứa dữ liệu phản hồi (bao gồm token, user)
 */
export const verifyTwoFactorOtp = async (email, otpCode) => {
  try {
    const response = await apiClient.post('/api/auth/verify-2fa', { email, otpCode });
    // Chỉ trả về dữ liệu. KHÔNG xử lý localStorage hay header ở đây nữa.
    return response.data;
  } catch (error) {
    console.error("API Error - Verify 2FA OTP in authService:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Gửi yêu cầu đổi mật khẩu cho người dùng đã đăng nhập.
 * @param {object} passwordData - Dữ liệu chứa currentPassword, newPassword, confirmNewPassword
 * @returns {Promise<object>} Promise chứa dữ liệu phản hồi từ API.
 */
export const changePassword = async (passwordData) => {
  try {
    // API endpoint này cần token xác thực đã được set vào apiClient bởi setGlobalAuthHeader
    const response = await apiClient.post('/api/auth/change-password', passwordData);
    return response.data; // Mong đợi { message: "..." }
  } catch (error) {
    console.error("API Error - Change Password in authService:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Xử lý đăng xuất người dùng.
 */
/**
 * Hàm logout giờ đây trống vì AuthContext sẽ xử lý việc xóa state phía client.
 * Có thể giữ lại để gọi API logout của backend nếu có trong tương lai.
 */
export const logout = () => {
  // localStorage.removeItem('authToken'); // <- XÓA DÒNG NÀY
  // setGlobalAuthHeader(null); // <- XÓA DÒNG NÀY
  console.log("Logout triggered. AuthContext will handle state clearance.");
};