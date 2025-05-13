# PROJECT THỰC TẬP 01: XÂY DỰNG HỆ THỐNG QUẢN TRỊ & XÁC THỰC TÀI KHOẢN TẬP TRUNG (IDENTITY SERVER)

Dự án này nhằm mục đích xây dựng một hệ thống quản trị và xác thực tài khoản tập trung, sử dụng kiến trúc Identity Server.

## I. Công nghệ sử dụng

*   **Database:**
    *   MongoDB
*   **Backend:**
    *   ASP.NET Core (6.0)
*   **Frontend:**
    *   Webpack
    *   React
    *   MUI UI Library (Material UI Component)

## II. Yêu cầu

### 1. Backend:

*   Khởi tạo cấu hình và triển khai được Identity trên server ASP.NET Core 6.0 và lưu trữ vào MongoDB.
*   Cho phép đăng ký tài khoản, xác thực tài khoản qua email, quên mật khẩu, xác thực 2 lớp (2FA). 
*   Cho phép người dùng cập nhật thông tin tài khoản, bật/tắt xác thực 2 lớp.
*   Cho phép quản trị viên:
    *   Tạo tài khoản.
    *   Khóa (mở khóa) tài khoản.
    *   Xóa tài khoản.
*   Cấu hình cho phép website xác thực bằng tài khoản Google (Google external login).

### 2. Frontend:

*   **Khởi tạo dự án Client:**
    *   Cấu hình Webpack.
    *   Cài đặt React.
    *   Cài đặt Material UI component.
*   **Triển khai xây dựng giao diện:**
    *   Đăng ký tài khoản.
    *   Giao diện yêu cầu xác thực email sau khi đăng ký.
    *   Giao diện hiển thị xác thực email thành công.
    *   Đăng nhập.
    *   Giao diện nhập mã OTP (cho 2FA).
    *   Quên mật khẩu (Nhập email để nhận token reset mật khẩu).
    *   Giao diện thông báo gửi email (reset mật khẩu) thành công.
    *   Giao diện reset mật khẩu.
    *   Giao diện thông báo reset mật khẩu thành công.
    *   **Quản lý tài khoản người dùng:**
        *   Upload avatar.
        *   Cập nhật thông tin người dùng.
    *   **Quản lý bảo mật tài khoản:**
        *   Đổi mật khẩu.
        *   Bật/tắt xác thực 2 lớp (2FA).
    *   **Giao diện quản trị dành cho Admin:**
        *   Danh sách tài khoản và trạng thái.
        *   Thông tin chi tiết của tài khoản.
        *   Tạo mới tài khoản.
