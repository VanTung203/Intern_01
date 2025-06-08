// client/src/components/admin/UserResetPasswordDialog.js
import React, { useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
    Grid, CircularProgress, Alert, Typography, Box
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { resetPasswordByAdmin } from '../../services/userService';

const UserResetPasswordDialog = ({ open, onClose, user }) => {
    const [serverError, setServerError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const formik = useFormik({
        initialValues: {
            newPassword: '',
            confirmPassword: '',
        },
        validationSchema: Yup.object({
            newPassword: Yup.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự').required('Bắt buộc'),
            confirmPassword: Yup.string()
                .oneOf([Yup.ref('newPassword'), null], 'Mật khẩu xác nhận không khớp')
                .required('Bắt buộc'),
        }),
        onSubmit: async (values, { setSubmitting, resetForm }) => {
            setServerError('');
            setSuccessMessage('');
            try {
                const response = await resetPasswordByAdmin(user.id, {
                    newPassword: values.newPassword,
                    confirmPassword: values.confirmPassword,
                });
                setSuccessMessage(response.message || 'Đặt lại mật khẩu thành công!');
                resetForm();
                setTimeout(() => { // Đợi một chút để người dùng đọc thông báo
                    onClose();
                }, 2000);
            } catch (error) {
                const message = error.response?.data?.message || 'Đã có lỗi xảy ra.';
                setServerError(message);
            } finally {
                setSubmitting(false);
            }
        },
    });

    // Reset form và thông báo khi dialog được mở lại
    React.useEffect(() => {
        if (open) {
            formik.resetForm();
            setServerError('');
            setSuccessMessage('');
        }
    }, [open]);

    if (!user) return null;

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle variant="h7" >Đặt lại mật khẩu</DialogTitle>
            <form onSubmit={formik.handleSubmit}>
                <DialogContent>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                        Bạn đang đặt lại mật khẩu cho tài khoản: <strong>{user.email}</strong>
                    </Typography>
                    
                    {serverError && <Alert severity="error" sx={{ mb: 2 }}>{serverError}</Alert>}
                    {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}
                    
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                id="newPassword"
                                name="newPassword"
                                label="Mật khẩu mới"
                                type="password"
                                value={formik.values.newPassword}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.newPassword && Boolean(formik.errors.newPassword)}
                                helperText={formik.touched.newPassword && formik.errors.newPassword}
                                disabled={formik.isSubmitting}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                id="confirmPassword"
                                name="confirmPassword"
                                label="Xác nhận mật khẩu mới"
                                type="password"
                                value={formik.values.confirmPassword}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                                helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
                                disabled={formik.isSubmitting}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button 
                        onClick={onClose} 
                        disabled={formik.isSubmitting}
                        sx={{
                            color: 'black',
                        }}
                        >Hủy
                    </Button>
                    <Button 
                        type="submit" 
                        variant="contained" 
                        disabled={formik.isSubmitting}
                        sx={{
                            backgroundColor: '#212B36', // 800: '#212B36'
                            color: 'white', // Màu chữ trắng
                            '&:hover': {
                                backgroundColor: '#454F5B', // Màu đậm hơn khi hover  
                            },
                        }}
                        >
                        {formik.isSubmitting ? <CircularProgress size={24} /> : 'Xác nhận'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default UserResetPasswordDialog;