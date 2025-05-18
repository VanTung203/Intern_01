// client/src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // File này có thể trống hoặc chứa global reset/styles
import App from './App';
import { ThemeProvider } from '@mui/material/styles'; // Import ThemeProvider
import CssBaseline from '@mui/material/CssBaseline'; // Để chuẩn hóa CSS
import theme from './theme/theme'; // Import theme vừa tạo

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}> {/* Bọc App bằng ThemeProvider */}
      <CssBaseline /> {/* Giúp reset CSS và áp dụng background, text color từ theme */}
      <App />
    </ThemeProvider>
  </React.StrictMode>
);