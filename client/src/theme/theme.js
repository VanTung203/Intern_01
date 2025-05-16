// client/src/theme/theme.js
import { createTheme } from '@mui/material/styles';

// Ví dụ một theme cơ bản
const theme = createTheme({
  palette: {
    mode: 'light', // Bạn có thể thử 'dark' nếu muốn
    primary: {
      main: '#1976d2', // Màu xanh dương chính
      // contrastText: '#fff', // Màu chữ trên nền primary (thường tự động)
    },
    secondary: {
      main: '#dc004e', // Màu hồng phụ
    },
    background: {
      default: '#f4f6f8', // Màu nền mặc định cho trang
      paper: '#ffffff',   // Màu nền cho các component như Card, Paper
    },
    // Bạn có thể tùy chỉnh thêm màu sắc, typography, v.v.
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    // Tùy chỉnh các kiểu chữ khác nếu cần
  },
  // Bạn có thể override các component style mặc định ở đây
  components: {
    MuiButton: { // Ví dụ: Tùy chỉnh tất cả các Button
      styleOverrides: {
        root: { // Áp dụng cho tất cả các variant của Button
          borderRadius: 8, // Bo tròn góc của button
          textTransform: 'none', // Không viết hoa chữ trong button
        },
      },
      defaultProps: { // Đặt giá trị mặc định cho props
        // disableRipple: true, // Tắt hiệu ứng gợn sóng khi click
      }
    },
    // MuiAppBar: { // Ví dụ tùy chỉnh AppBar
    //   styleOverrides: {
    //     colorPrimary: {
    //       backgroundColor: '#333' // Đổi màu AppBar chính
    //     }
    //   }
    // }
  },
});

export default theme;