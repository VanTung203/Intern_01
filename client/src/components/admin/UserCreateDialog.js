// client/src/components/admin/UserCreateDialog.js
import React, { useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
    FormControl, InputLabel, Select, MenuItem, Grid, FormHelperText,
    CircularProgress, Alert
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { createUserByAdmin } from '../../services/userService';

const UserCreateDialog = ({ open, onClose, onUserCreated }) => {
    const [serverError, setServerError] = useState('');

    const formik = useFormik({
        initialValues: {
            email: '',
            password: '',
            confirmPassword: '',
            firstName: '',
            lastName: '',
            role: 'User', // Mặc định là User
        },
        validationSchema: Yup.object({
            email: Yup.string().email('Địa chỉ email không hợp lệ').required('Bắt buộc'),
            password: Yup.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự').required('Bắt buộc'),
            confirmPassword: Yup.string()
                .oneOf([Yup.ref('password'), null], 'Mật khẩu xác nhận không khớp')
                .required('Bắt buộc'),
            firstName: Yup.string(),
            lastName: Yup.string(),
            role: Yup.string().oneOf(['User', 'Admin']).required('Bắt buộc'),
        }),
        onSubmit: async (values, { setSubmitting, resetForm }) => {
            setServerError('');
            try {
                const response = await createUserByAdmin({
                    email: values.email,
                    password: values.password,
                    confirmPassword: values.confirmPassword,
                    firstName: values.firstName,
                    lastName: values.lastName,
                    role: values.role,
                });
                onUserCreated(response.user); // Gọi callback để cập nhật list
                resetForm();
                onClose(); // Đóng dialog
            } catch (error) {
                const message = error.response?.data?.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.';
                setServerError(message);
            } finally {
                setSubmitting(false);
            }
        },
    });

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle variant="h7" > Thêm tài khoản mới</DialogTitle>
            <form onSubmit={formik.handleSubmit}>
                <DialogContent>
                    {serverError && <Alert severity="error" sx={{ mb: 2 }}>{serverError}</Alert>}
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                id="email"
                                name="email"
                                label="Địa chỉ email"
                                value={formik.values.email}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.email && Boolean(formik.errors.email)}
                                helperText={formik.touched.email && formik.errors.email}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                id="password"
                                name="password"
                                label="Mật khẩu"
                                type="password"
                                value={formik.values.password}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.password && Boolean(formik.errors.password)}
                                helperText={formik.touched.password && formik.errors.password}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                id="confirmPassword"
                                name="confirmPassword"
                                label="Xác nhận mật khẩu"
                                type="password"
                                value={formik.values.confirmPassword}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                                helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                id="firstName"
                                name="firstName"
                                label="Họ và tên đệm"
                                value={formik.values.firstName}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                id="lastName"
                                name="lastName"
                                label="Tên"
                                value={formik.values.lastName}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl 
                                fullWidth error={formik.touched.role && Boolean(formik.errors.role)}
                                size="small"
                                sx={{minWidth: 100}}
                                >
                                <InputLabel>Vai trò</InputLabel>
                                <Select
                                    id="role"
                                    name="role"
                                    label="Vai trò"
                                    value={formik.values.role}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                >
                                    <MenuItem value="User">User</MenuItem>
                                    <MenuItem value="Admin">Admin</MenuItem>
                                </Select>
                                {formik.touched.role && formik.errors.role && (
                                    <FormHelperText>{formik.errors.role}</FormHelperText>
                                )}
                            </FormControl>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button 
                        sx={{
                            color: 'black',
                        }}
                        onClick={onClose}>Hủy</Button>
                    <Button 
                        type="submit" 
                        variant="contained" 
                        sx={{
                            backgroundColor: '#212B36', // 800: '#212B36'
                            color: 'white', // Màu chữ trắng
                            '&:hover': {
                                backgroundColor: '#454F5B', // Màu đậm hơn khi hover  
                            },
                        }}
                        disabled={formik.isSubmitting}>
                            {formik.isSubmitting ? <CircularProgress size={24} /> : 'Tạo tài khoản'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default UserCreateDialog;