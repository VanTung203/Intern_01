// client/src/components/User/UserProfileInfoForm.js
import React, { useState, useEffect } from 'react';
import { Box, Grid, TextField, Button, Typography, CircularProgress, Select, MenuItem, FormControl, FormHelperText, Alert } from '@mui/material';
import { getUserProfile, updateUserProfile, uploadAvatar } from '../../services/userService';
import { useOutletContext } from 'react-router-dom';

// --- Các component renderFloatingLabel... giữ nguyên như cũ ---
const renderFloatingLabelTextField = ({ name, labelText, placeholder, type = 'text', value, onChange, error, disabled, isRequired = false, multiline = false, rows = 1, InputProps, gridSize = { xs: 12, sm: 6 }, boxSx }) => (
    <Grid item {...gridSize}>
        <Box sx={{ position: 'relative', width: '100%', minWidth: '300px', ...boxSx }}>
            <Typography variant="caption" component="label" htmlFor={name} sx={{ position: 'absolute', top: '-9px', left: '12px', backgroundColor: (theme) => theme.palette.background.paper, px: '5px', fontSize: '11.5px', color: error ? 'error.main' : 'text.secondary', fontWeight: 500, zIndex: 1 }}>
                {labelText} {isRequired && '*'}
            </Typography>
            <TextField fullWidth id={name} name={name} type={type} placeholder={placeholder} value={value || ''} onChange={onChange} error={!!error} helperText={error || ''} disabled={disabled} multiline={multiline} rows={rows} InputProps={InputProps} inputProps={{ style: { paddingTop: '17.5px', paddingBottom: '17.5px', fontSize: '0.9rem' } }}
                sx={{ '& .MuiInputBase-input.Mui-disabled': { WebkitTextFillColor: 'rgba(0, 0, 0, 0.87)' }, 
                    '& .MuiOutlinedInput-root.Mui-disabled': { backgroundColor: 'transparent' },                     
                    '& .MuiOutlinedInput-root': {
                        backgroundColor: 'transparent', // Đảm bảo không có màu nền mặc định cho TextField
                        '& fieldset': {
                            borderColor: '#c0c0c0', // Màu viền mặc định
                        },
                        '&:hover fieldset': {
                            borderColor: '#808080', // Màu viền khi hover
                        },
                        '&.Mui-focused fieldset': {
                            borderColor: (theme) => theme.palette.primary.main, // Màu viền khi focus
                            borderWidth: '2px', // Độ dày viền khi focus
                        },
                        // Xóa màu nền khi disabled cho phần root của TextField
                        '&.Mui-disabled': {
                            backgroundColor: 'transparent',
                        },
                    },  
                }}
            />
        </Box>

    </Grid>
);

const renderFloatingLabelSelectField = ({ name, labelText, value, onChange, error, disabled, options, isRequired = false, gridSize = { xs: 12, sm: 6 }, boxSx }) => (
    <Grid item {...gridSize}>
        <Box sx={{ position: 'relative', width: '100%', minWidth: '300px',...boxSx }}>
            <Typography variant="caption" component="label" htmlFor={name} sx={{ position: 'absolute', top: '-9px', left: '12px', backgroundColor: (theme) => theme.palette.background.paper, px: '5px', fontSize: '11.5px', color: error ? 'error.main' : 'text.secondary', fontWeight: 500, zIndex: 1 }}>
                {labelText} {isRequired && '*'}
            </Typography>
            <FormControl fullWidth error={!!error} disabled={disabled} sx={{ '& .MuiOutlinedInput-root.Mui-disabled': { backgroundColor: 'transparent' }, '& .MuiInputBase-input.Mui-disabled': { WebkitTextFillColor: 'rgba(0, 0, 0, 0.87)' } }}>
                <Select id={name} name={name} value={value || ''} onChange={onChange} displayEmpty inputProps={{ style: { fontSize: '0.9rem' } }}>
                    <MenuItem value="" disabled><em>Chọn...</em></MenuItem>
                    {options.map((option) => ( <MenuItem key={option.id || option.value || option} value={option.id || option.value || option}> {option.name || option} </MenuItem>))}
                </Select>
                {error && <FormHelperText sx={{ml: '14px'}}>{error}</FormHelperText>}
            </FormControl>
        </Box>
    </Grid>
);


// --- UserProfileInfoForm Component (ĐÃ SỬA ĐỔI) ---
const UserProfileInfoForm = () => {
    // Nhận state và các hàm từ component cha qua context
    const { handleInfoUpdate, avatarFile, clearAvatarFile } = useOutletContext() || {};

    const [profile, setProfile] = useState({
        firstName: '', lastName: '', email: '', phoneNumber: '',
        province: '', district: '', ward: '', streetAddress: '', avatarUrl: ''
    });
    const [initialProfile, setInitialProfile] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [apiMessage, setApiMessage] = useState(null);
    const [errors, setErrors] = useState({});

    // Dữ liệu địa chỉ giả định
    const provincesData = [{ id: 'HCM', name: 'TP. Hồ Chí Minh' }, { id: 'HN', name: 'Hà Nội' }];
    const districtsData = { HCM: [{ id: 'Q1', name: 'Quận 1' }], HN: [{ id: 'HK', name: 'Hoàn Kiếm' }] };
    const wardsData = { Q1: [{ id: 'BT', name: 'Bến Thành' }], HK: [{ id: 'HG', name: 'Hàng Gai' }] };

        // --- HÀM TẠO URL ĐẦY ĐỦ CHO AVATAR ---
    const getFullAvatarUrl = (relativePath) => {
        if (!relativePath) {
            return null;
        }
        // REACT_APP_API_BASE_URL_FOR_FILES là biến môi trường trỏ đến http://localhost:5116
        // Nó sẽ nối 'http://localhost:5116' với '/avatars/filename.jpg'
        return `${process.env.REACT_APP_API_BASE_URL_FOR_FILES}${relativePath}`;
    };

    // Fetch dữ liệu ban đầu
    useEffect(() => {
        const fetchProfile = async () => {
            setIsLoading(true);
            try {
                const data = await getUserProfile();
                const initialData = {
                    firstName: data.firstName || '', lastName: data.lastName || '',
                    email: data.email || '', phoneNumber: data.phoneNumber || '',
                    province: data.province || '', district: data.district || '',
                    ward: data.ward || '', streetAddress: data.streetAddress || '',
                    avatarUrl: data.avatarUrl || ''
                };
                setProfile(initialData);
                setInitialProfile(initialData);

                // Gửi thông tin lên component cha để hiển thị avatar và tên
                if (handleInfoUpdate) {
                    handleInfoUpdate(getFullAvatarUrl(data.avatarUrl), data.firstName);
                }
            } catch (error) {
                setApiMessage({ type: 'error', text: 'Không thể tải thông tin hồ sơ.' });
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfile();
    }, [handleInfoUpdate]);
    
    // Gửi tên lên component cha mỗi khi thay đổi [TẠM THỜI XÓA ĐOẠN CODE]
    // useEffect(() => {
    //     if(handleInfoUpdate && profile.firstName !== initialProfile.firstName) {
    //         handleInfoUpdate(
    //             profile.avatarUrl ? `${process.env.REACT_APP_API_BASE_URL_FOR_FILES}${profile.avatarUrl}` : null,
    //             profile.firstName
    //         );
    //     }
    // }, [profile.firstName, profile.avatarUrl, initialProfile.firstName, handleInfoUpdate]);


    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
        if (apiMessage) setApiMessage(null);
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null}));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setApiMessage(null);
        setErrors({});

        try {
            let newAvatarPath = profile.avatarUrl;

            // BƯỚC 1: Nếu có file avatar mới, upload nó trước
            if (avatarFile) {
                const formData = new FormData();
                formData.append('file', avatarFile);
                const avatarResponse = await uploadAvatar(formData);
                // Giả sử API trả về { filePath: 'path/to/new/avatar.png' }
                newAvatarPath = avatarResponse.filePath; 
            }

            // BƯỚC 2: Chuẩn bị dữ liệu để cập nhật profile
            // Gửi tất cả các trường, giải quyết vấn đề phụ thuộc
            const profileToUpdate = {
                firstName: profile.firstName,
                lastName: profile.lastName,
                phoneNumber: profile.phoneNumber,
                province: profile.province,
                district: profile.district,
                ward: profile.ward,
                streetAddress: profile.streetAddress,
                avatarUrl: newAvatarPath, // Sử dụng đường dẫn avatar mới (nếu có)
            };
            
            // BƯỚC 3: Gọi API cập nhật thông tin người dùng
            const updateResponse = await updateUserProfile(profileToUpdate);

            // BƯỚC 4: Cập nhật state thành công
            const updatedProfileData = { ...profile, avatarUrl: newAvatarPath };
            setProfile(updatedProfileData);
            setInitialProfile(updatedProfileData);
            
            if (clearAvatarFile) {
                clearAvatarFile(); // Xóa file đã chọn ở component cha
            }

            // Cập nhật lại avatar preview ở cha với đường dẫn mới nhất từ server
             if (handleInfoUpdate) {
                const finalPreview = newAvatarPath ? `${process.env.REACT_APP_API_BASE_URL_FOR_FILES}${newAvatarPath}` : null;
                handleInfoUpdate(finalPreview, updatedProfileData.firstName);
            }

            setApiMessage({ type: 'success', text: updateResponse.message || 'Cập nhật hồ sơ thành công!' });

        } catch (error) {
            const errorData = error.response?.data;
            setApiMessage({ type: 'error', text: errorData?.message || errorData?.title || 'Lỗi cập nhật hồ sơ.' });
            if (errorData?.errors) {
                setErrors(errorData.errors);
            }

            // Nếu có lỗi, phục hồi lại avatar preview cũ
            if (handleInfoUpdate) {
               const oldPreview = initialProfile.avatarUrl ? `${process.env.REACT_APP_API_BASE_URL_FOR_FILES}${initialProfile.avatarUrl}` : null;
               handleInfoUpdate(oldPreview, initialProfile.firstName);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // Kiểm tra xem có sự thay đổi nào không (dữ liệu form hoặc file avatar)
    const hasChanges = JSON.stringify(profile) !== JSON.stringify(initialProfile) || !!avatarFile;

    if (isLoading) {
        return <Box sx={{display: 'flex', justifyContent:'center', alignItems:'center', height: '100%'}}><CircularProgress /></Box>;
    }

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {apiMessage && <Alert severity={apiMessage.type} sx={{ mb: 2 }} onClose={() => setApiMessage(null)}>{apiMessage.text}</Alert>}

            <Grid container spacing={3} sx={{ flexGrow: 1 }}>
                {renderFloatingLabelTextField({ name: "lastName", labelText: "Họ", value: profile.lastName, onChange: handleChange, placeholder: "Nguyễn Văn...", disabled: isSubmitting})}
                {renderFloatingLabelTextField({ name: "firstName", labelText: "Tên", value: profile.firstName, onChange: handleChange, placeholder: "A...", disabled: isSubmitting})}
                {renderFloatingLabelTextField({ name: "phoneNumber", labelText: "Số điện thoại", value: profile.phoneNumber, onChange: handleChange, placeholder: "0xxxxxxxxx", type: "tel", disabled: isSubmitting })}
                {renderFloatingLabelSelectField({ name: "province", labelText: "Tỉnh/Thành phố", value: profile.province, onChange: handleChange, options: provincesData, disabled: isSubmitting })}
                {renderFloatingLabelSelectField({ name: "district", labelText: "Quận/Huyện", value: profile.district, onChange: handleChange, options: districtsData[profile.province] || [], disabled: !profile.province || isSubmitting })}
                {renderFloatingLabelSelectField({ name: "ward", labelText: "Phường/Xã", value: profile.ward, onChange: handleChange, options: wardsData[profile.district] || [], disabled: !profile.district || isSubmitting })}
                {renderFloatingLabelTextField({ name: "streetAddress", labelText: "Địa chỉ", value: profile.streetAddress, onChange: handleChange, placeholder: "Số nhà, tên đường...", disabled: isSubmitting, gridSize: { xs: 12 }, boxSx: { minWidth: '310%' } })}
            </Grid>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 'auto', pt: 5, mr: 2 }}>
                <Button
                    type="submit"
                    variant="contained"
                    disabled={isSubmitting || !hasChanges}
                    sx={{ minWidth: 20 }}
                    startIcon={isSubmitting ? <CircularProgress size={20} color="inherit"/> : null}
                >
                    {isSubmitting ? "Đang lưu..." : "Cập nhật"}
                </Button>
            </Box>
        </Box>
    );
};

export default UserProfileInfoForm;