// client/src/components/admin/UserDetailsDialog.js
import React from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button,
    Typography, Box, Grid, Divider, Stack, Avatar
} from '@mui/material';

// Component nhỏ để hiển thị một cặp thông tin (label và value)
// Thêm sx để tùy chỉnh style
const DetailItem = ({ label, value }) => (
    <Box>
        <Typography variant="body2" color="text.secondary">
            {label}
        </Typography>
        <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
            {value || '...'}
        </Typography>
    </Box>
);

const UserDetailsDialog = ({ open, onClose, user }) => {
    if (!user) {
        return null;
    }

    const fullAddress = [user.streetAddress, user.ward, user.district, user.province]
        .filter(Boolean)
        .join(', ');

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Chi tiết tài khoản</DialogTitle>
            <DialogContent>
                {/* Phần Header với Avatar và Email */}
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                    <Avatar src={user.avatarUrl} sx={{ width: 50, height: 50 }}>
                        {user.email.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                        <Typography variant="body1" color="text.secondary">{user.email}</Typography>
                    </Box>
                </Stack>
                <Divider sx={{ my: 2 }} />

                {/* Phần thông tin chi tiết */}
                <Grid container spacing={10}> {/* Tăng khoảng cách giữa các item */}
                    <Grid item xs={12} md={6}>
                        <DetailItem label="Họ và tên đệm" value={user.firstName} />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <DetailItem label="Tên" value={user.lastName} />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <DetailItem label="Số điện thoại" value={user.phoneNumber} />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <DetailItem label="Tỉnh/Thành phố" value={user.province} />
                    </Grid>
                     <Grid item xs={12} md={6}>
                        <DetailItem label="Quận/Huyện" value={user.district} />
                    </Grid>
                     <Grid item xs={12} md={6}>
                        <DetailItem label="Phường/Xã" value={user.ward} />
                    </Grid>
                    <Grid item xs={12}>
                        <DetailItem label="Địa chỉ đầy đủ" value={fullAddress} />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions sx={{ p: '16px 24px' }}>
                <Button 
                    onClick={onClose} 
                    variant="outlined"
                    sx={{
                            backgroundColor: '#212B36', // 800: '#212B36'
                            color: 'white', // Màu chữ trắng
                            '&:hover': {
                                backgroundColor: '#454F5B', // Màu đậm hơn khi hover  
                            },
                        }}
                >Đóng</Button>
            </DialogActions>
        </Dialog>
    );
};

export default UserDetailsDialog;