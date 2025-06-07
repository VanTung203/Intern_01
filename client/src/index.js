// client/src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom'; // <-- THÊM DÒNG NÀY
import App from './App';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme/theme';
import { AuthProvider } from './context/AuthContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <Router> {/* <-- BỌC Ở ĐÂY */}
        <AuthProvider>
          <CssBaseline />
          <App />
        </AuthProvider>
      </Router> {/* <-- BỌC Ở ĐÂY */}
    </ThemeProvider>
  </React.StrictMode>
);