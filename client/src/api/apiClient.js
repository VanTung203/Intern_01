// client/src/api/apiClient.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5116';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // timeout: 10000, // Optional
});

// Interceptor để log request (tùy chọn)
apiClient.interceptors.request.use(request => {
  console.log('Starting Request:', JSON.stringify(request, null, 2));
  return request;
});

// Interceptor để log response hoặc xử lý lỗi chung (tùy chọn)
apiClient.interceptors.response.use(response => {
  console.log('Response:', JSON.stringify(response, null, 2));
  return response;
}, error => {
  console.error('API Call Error: ', error.response || error.message || error);
  if (error.response && error.response.status === 401) {
    // Xử lý lỗi 401 (Unauthorized) tập trung ở đây nếu muốn
    // Ví dụ: gọi hàm logout, điều hướng về trang login
    // logoutAndRedirect(); // cần định nghĩa hàm này hoặc gọi trực tiếp từ authService
    console.log("Unauthorized request, potentially redirecting to login.");
  }
  return Promise.reject(error); // Quan trọng: Ném lại lỗi
});


export const setGlobalAuthHeader = (token) => {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    console.log('Global auth header SET with token.');
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
    console.log('Global auth header REMOVED.');
  }
};

export default apiClient;