// client/src/components/admin/UserDeleteConfirmDialog.js
import React from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button,
    Typography, Box, Alert
} from '@mui/material';

const UserDeleteConfirmDialog = ({ open, onClose, onConfirm, user, isSubmitting, error }) => {
    if (!user) return null;

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle>Xác nhận Xóa tài khoản</DialogTitle>
            <DialogContent>
                <Typography variant="body1">
                    Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản của 
                    <strong> {user.email}</strong>?
                </Typography>
                <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                    Hành động này không thể hoàn tác.
                </Typography>
                 {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
            </DialogContent>
            <DialogActions>
                <Button
                    sx={{ color: 'black' }} 
                    onClick={onClose} 
                    disabled={isSubmitting}
                    >Hủy
                </Button>
                <Button 
                    onClick={onConfirm} 
                    variant="contained" 
                    color="error"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Đang xóa...' : 'Xóa'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default UserDeleteConfirmDialog;