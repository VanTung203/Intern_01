// client/src/layouts/DashboardLayout.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  CssBaseline,
  CircularProgress
} from '@mui/material';
import { Outlet, useNavigate } from 'react-router-dom';

import { logout } from '../../services/authService';
import { getUserProfile } from '../../services/userService';
import { setGlobalAuthHeader } from '../../api/apiClient';

const DashboardLayout = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setGlobalAuthHeader(token);
      const fetchProfile = async () => {
        setIsLoadingProfile(true);
        try {
          const profileData = await getUserProfile();
          setCurrentUser(profileData);
        } catch (error) {
          console.error("DashboardLayout: Failed to fetch user profile", error.response?.data || error.message);
          if (error.response && error.response.status === 401) {
            handleLogoutAndRedirect();
          }
        } finally {
          setIsLoadingProfile(false);
        }
      };
      fetchProfile();
    } else {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  const handleLogoutAndRedirect = () => {
    logout();
    setCurrentUser(null);
    navigate('/login', { replace: true });
  };

  if (isLoadingProfile && !currentUser) {
    return (
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: (theme) => theme.palette.grey[100]
      }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      backgroundColor: (theme) => theme.palette.grey[100]
    }}>
      <CssBaseline />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          px: { xs: 2, sm: 4, md: 6 }, // padding left/right responsive
          py: { xs: 3, sm: 4 },
          width: '100%' // đảm bảo không bị giới hạn
        }}
      >
        <Outlet context={{ currentUser }} />
      </Box>
    </Box>
  );
};

export default DashboardLayout;
