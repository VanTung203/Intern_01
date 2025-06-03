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
 * @param {object} credentials - Dữ liệu đăng nhập (ví dụ: { email, password })
 * @returns {Promise<object>} Promise chứa dữ liệu phản hồi (ví dụ: token).
 */
export const login = async (credentials) => {
  try {
    const response = await apiClient.post('/api/auth/login', credentials);
    // KIỂM TRA XEM CÓ YÊU CẦU 2FA KHÔNG
    if (response.data && response.data.requiresTwoFactor) {
      return { requiresTwoFactor: true, email: response.data.email, message: response.data.message }; // Trả về đối tượng chỉ thị 2FA
    }

    // Nếu không yêu cầu 2FA, xử lý token như bình thường
    if (response.data && response.data.token) {
      localStorage.setItem('authToken', response.data.token);
      setGlobalAuthHeader(response.data.token);
      return { token: response.data.token, expiresIn: response.data.expiresIn, message: response.data.message }; // Trả về token
    }
    // Trường hợp không có token và cũng không yêu cầu 2FA (lỗi logic server)
    throw new Error(response.data?.message || 'Đăng nhập không thành công, không nhận được token.');
  } catch (error) {
    console.error("API Error - Login in authService:", error.response?.data || error.message);
    localStorage.removeItem('authToken');
    setGlobalAuthHeader(null);
    throw error;
  }
};

// >>> HÀM XÁC THỰC OTP 2FA <<<
export const verifyTwoFactorOtp = async (email, otpCode) => {
  try {
    const response = await apiClient.post('/api/auth/verify-2fa', { email, otpCode });
    // Sau khi xác thực OTP thành công, backend sẽ trả về token
    if (response.data && response.data.token) {
      // Không cần lưu token ở đây, TwoFactorAuthForm sẽ làm
      return response.data;
    }
    // Trường hợp API trả về 200 OK nhưng không có token
    throw new Error(response.data?.message || 'Xác thực OTP không thành công, không nhận được token.');
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
export const logout = () => {
  localStorage.removeItem('authToken');
  setGlobalAuthHeader(null); // Sử dụng hàm set header toàn cục để xóa token khỏi apiClient
  // TODO: Cân nhắc gọi API logout ở backend nếu có để vô hiệu hóa token phía server (nếu cần thiết).
  // Ví dụ:
  // try {
  //   await apiClient.post('/api/auth/logout');
  // } catch (error) {
  //   console.error("API Error - Logout (optional):", error.response?.data || error.message);
  // }
  console.log("User logged out via authService, global auth header cleared.");
};