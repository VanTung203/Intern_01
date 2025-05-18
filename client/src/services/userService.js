// client/src/services/userService.js
import apiClient from '../api/apiClient'; // Import instance chung

// Hàm setUserAuthHeader không còn cần thiết ở đây nếu đã dùng global header

export const getUserProfile = async () => {
  try {
    const response = await apiClient.get('/api/user/me');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateUserProfile = async (profileData) => {
  try {
    const response = await apiClient.put('/api/user/me/profile', profileData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const uploadAvatar = async (formDataFile) => {
  try {
    const response = await apiClient.post('/api/user/me/avatar', formDataFile, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};