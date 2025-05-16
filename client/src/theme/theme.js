// client/src/theme/theme.js
import { createTheme, alpha } from '@mui/material/styles';

// Đảm bảo bạn đã import font Public Sans vào public/index.html
// <link href="https://fonts.googleapis.com/css2?family=Public+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
const FONT_FAMILY = '"Public Sans", sans-serif';

const GREY = {
  0: '#FFFFFF',
  100: '#F9FAFB', // Nền xám rất nhạt cho input và cột trái
  200: '#F4F6F8',
  300: '#DFE3E8',
  400: '#C4CDD5',
  500: '#919EAB', // Màu text phụ, label, icon
  600: '#637381',
  700: '#454F5B',
  800: '#212B36', // Màu text chính, màu nút
  900: '#161C24', // Màu nút hover
};

const PRIMARY = {
  lighter: '#D1E9FC',
  light: '#76B0F1',
  main: '#007BFF', // Màu xanh cho link "Đăng nhập", link điều khoản (điều chỉnh cho giống mẫu)
  dark: '#0052B4',
  darker: '#003A75',
  contrastText: '#fff',
};

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: PRIMARY,
    text: {
      primary: GREY[800],      // Ví dụ: #212B36
      secondary: GREY[600],    // Ví dụ: #637381
    },
    background: {
      default: '#FFFFFF',     // Nền trắng cho toàn trang
      paper: '#FFFFFF',       // Nền trắng cho form
    },
    divider: alpha(GREY[500], 0.24),
    action: {
      active: GREY[600],
      hover: alpha(GREY[500], 0.08),
      // ... các màu action khác
    }
  },
  typography: {
    fontFamily: FONT_FAMILY,
    fontWeightRegular: 400,
    fontWeightMedium: 500, // Hoặc 600 tùy theo mẫu
    fontWeightBold: 700,   // Hoặc 800

    h1: { fontWeight: 700, fontSize: '2.5rem', lineHeight: 1.3, color: GREY[800] }, // "Vietbando, Xin Chào!"
    h2: { fontWeight: 700, fontSize: '1.75rem', lineHeight: 1.4, color: GREY[800] },// "Đăng ký tài khoản"
    // Giảm bớt h3, h4, h5, h6 nếu không dùng hoặc điều chỉnh lại
    h3: { fontWeight: 700, fontSize: '2rem', lineHeight: 1.4 },
    h4: { fontWeight: 700, fontSize: '1.75rem', lineHeight: 1.5 },
    h5: { fontWeight: 700, fontSize: '1.5rem', lineHeight: 1.5 }, // Có thể dùng cho "Đăng ký tài khoản"
    h6: { fontWeight: 400, fontSize: '1.125rem', lineHeight: 1.6, color: GREY[600] }, // Mô tả dưới "Vietbando, Xin Chào!"

    subtitle1: { fontWeight: 600, fontSize: '1rem', lineHeight: 1.5 },
    subtitle2: { fontWeight: 500, fontSize: '0.875rem', lineHeight: 1.5, color: GREY[600] }, // "Bạn đã có tài khoản?"

    body1: { fontSize: '1rem', lineHeight: 1.6, color: GREY[700] }, // Có thể dùng cho mô tả cột trái
    body2: { fontSize: '0.875rem', lineHeight: 1.5, color: GREY[600] }, // Text của checkbox, link "Cần trợ giúp?"

    caption: { fontSize: '0.75rem', lineHeight: 1.5, color: GREY[500], fontWeight: 500 }, // Label trên input

    button: { fontWeight: 600, textTransform: 'none', fontSize: '0.9375rem' },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        size: 'small',
      },
      styleOverrides: {
        root: ({ theme }) => ({ // Thêm theme để truy cập palette
          '& .MuiOutlinedInput-root': {
            borderRadius: theme.shape.borderRadius,
            backgroundColor: GREY[100], // Nền xám rất nhạt cho input
            '& fieldset': {
              borderColor: 'transparent', // Bỏ viền
            },
            '&:hover fieldset': {
              borderColor: alpha(GREY[500], 0.32), // Viền mờ khi hover
            },
            '&.Mui-focused fieldset': {
              borderColor: theme.palette.primary.main,
              borderWidth: '1px',
              // boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`, // Bỏ shadow để giống mẫu
            },
            // Giảm padding bên trong input một chút
            '& .MuiInputBase-input': {
                paddingTop: '10px',
                paddingBottom: '10px',
                fontSize: '0.95rem', // Kích thước chữ trong input
            },
          },
          '& .MuiFormHelperText-root': {
            marginLeft: '2px',
            marginTop: '3px',
            fontSize: '0.7rem',
          }
        }),
      }
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: theme.shape.borderRadius,
          padding: '10px 22px', // Điều chỉnh padding cho nút to hơn
        }),
        // Contained màu tối cho nút Tạo tài khoản (đã style trực tiếp trong RegisterForm, nhưng có thể tạo variant)
      },
    },
    MuiCheckbox: {
      defaultProps: {
        size: 'small',
      },
      styleOverrides: {
        root: {
            padding: '4px',
            '&.Mui-checked': {
                // color: PRIMARY.main, // Màu khi được check
            }
        }
      }
    },
    MuiFormControlLabel: {
        styleOverrides: {
            label: ({ theme }) => ({
                fontSize: '13px', // Hoặc theme.typography.body2.fontSize
                color: theme.palette.text.secondary,
            })
        }
    },
    MuiLink: {
        defaultProps: {
            underline: 'none',
        },
        styleOverrides: {
            root: ({ theme }) => ({
                fontWeight: theme.typography.fontWeightMedium, // Hoặc 600
                color: theme.palette.primary.main,
                '&:hover': {
                    textDecoration: 'underline',
                }
            })
        }
    },
    MuiAppBar: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: theme.palette.background.default, // Nền AppBar giống nền trang
        })
      }
    }
  },
});

export default theme;