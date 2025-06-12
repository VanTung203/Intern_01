// client/src/components/User/UserProfileInfoForm.js
import React, { useState, useEffect, useRef } from 'react';
import { Box, Grid, TextField, Button, Typography, CircularProgress, Select, MenuItem, FormControl, FormHelperText, Alert } from '@mui/material';
import { getUserProfile, updateUserProfile, uploadAvatar } from '../../services/userService';
import { useOutletContext } from 'react-router-dom';

// --- renderFloatingLabelTextField SỬA ĐỔI ---
const renderFloatingLabelTextField = ({ name, labelText, placeholder, type = 'text', value, onChange, error, disabled, isRequired = false, multiline = false, rows = 1, InputProps, gridSize = { xs: 12, sm: 6 }, boxSx }) => (
    <Grid item {...gridSize}> {/* Sử dụng gridSize được truyền vào */}
        <Box sx={{
            position: 'relative',
            width: '100%',
            minWidth: '300px', // Đặt minWidth mặc định là 300px
            margin: '0 auto', // Căn giữa phần tử trong Grid item
            ...boxSx // Thêm các thuộc tính sx được truyền vào cho Box
        }}>
            <Typography
                variant="caption" component="label" htmlFor={name}
                sx={{ position: 'absolute', top: '-9px', left: '12px', backgroundColor: (theme) => theme.palette.background.paper, px: '5px', fontSize: '11.5px', color: error ? 'error.main' : 'text.secondary', fontWeight: 500, zIndex: 1 }}
            >
                {labelText} {isRequired && '*'}
            </Typography>
            <TextField
                required={isRequired} margin="none" fullWidth id={name} name={name} type={type}
                placeholder={placeholder} value={value || ''} onChange={onChange}
                error={!!error} helperText={error || ''} disabled={disabled}
                multiline={multiline} rows={rows}
                InputProps={InputProps}
                inputProps={{ style: { paddingTop: '17.5px', paddingBottom: '17.5px', fontSize: '0.9rem' } }}
                sx={{
                    // Áp dụng màu nền transparent cho input element khi disabled
                    '& .MuiInputBase-input.Mui-disabled': {
                        WebkitTextFillColor: 'rgba(0, 0, 0, 0.87)', // Giữ màu chữ mặc định (đen hoặc gần đen)
                        opacity: 1, // Đảm bảo opacity không bị giảm
                        backgroundColor: 'transparent', // Xóa màu nền xám
                    },
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

// --- renderFloatingLabelSelectField SỬA ĐỔI ---
const renderFloatingLabelSelectField = ({ name, labelText, value, onChange, error, disabled, options, isRequired = false, gridSize = { xs: 12, sm: 6 }, boxSx }) => (
    <Grid item {...gridSize}> {/* Sử dụng gridSize được truyền vào */}
        <Box sx={{
            position: 'relative',
            width: '100%',
            minWidth: '300px', // Đặt minWidth mặc định là 300px
            margin: '0 auto', // Căn giữa phần tử trong Grid item
            ...boxSx // Thêm các thuộc tính sx được truyền vào cho Box
        }}>
            <Typography
                variant="caption" component="label" htmlFor={name}
                sx={{ position: 'absolute', top: '-9px', left: '12px', backgroundColor: (theme) => theme.palette.background.paper, px: '5px', fontSize: '11.5px', color: error ? 'error.main' : 'text.secondary', fontWeight: 500, zIndex: 1 }}
            >
                {labelText} {isRequired && '*'}
            </Typography>
            <FormControl fullWidth error={!!error} disabled={disabled} sx={{
                // Áp dụng màu nền transparent cho Select khi disabled
                '& .MuiOutlinedInput-root.Mui-disabled': {
                    backgroundColor: 'transparent',
                },
                '& .MuiInputBase-input.Mui-disabled': {
                    WebkitTextFillColor: 'rgba(0, 0, 0, 0.87)', // Giữ màu chữ mặc định
                    opacity: 1, // Đảm bảo opacity không bị giảm
                },
            }}>
                <Select
                    id={name} name={name} value={value || ''} onChange={onChange}
                    displayEmpty
                    inputProps={{ style: { fontSize: '0.9rem' } }}
                    sx={{
                        backgroundColor: 'transparent', // Đảm bảo không có màu nền mặc định cho Select
                        '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#c0c0c0', // Màu viền mặc định
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#808080', // Màu viền khi hover
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: (theme) => theme.palette.primary.main, // Màu viền khi focus
                            borderWidth: '2px', // Độ dày viền khi focus
                        },
                    }}
                >
                    <MenuItem value="" disabled><em>Chọn...</em></MenuItem>
                    {options.map((option) => (
                        <MenuItem key={option.id || option.value || option} value={option.id || option.value || option}>
                            {option.name || option}
                        </MenuItem>
                    ))}
                </Select>
                {error && <FormHelperText sx={{ml: '14px'}}>{error}</FormHelperText>}
            </FormControl>
        </Box>
    </Grid>
);


const UserProfileInfoForm = () => {
    const { handleAvatarUpdate } = useOutletContext() || {};

    const [profile, setProfile] = useState({
        firstName: '', lastName: '', email: '', phoneNumber: '',
        province: '', district: '', ward: '', streetAddress: '', avatarUrl: ''
    });
    const [initialProfile, setInitialProfile] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [avatarFile, setAvatarFile] = useState(null);
    const [apiMessage, setApiMessage] = useState(null);
    const [errors, setErrors] = useState({});

    const fileInputRef = useRef(null);

    const provincesData = [{ id: 'HCM', name: 'TP. Hồ Chí Minh' }, { id: 'HN', name: 'Hà Nội' }];
    const districtsData = { HCM: [{ id: 'Q1', name: 'Quận 1' }], HN: [{ id: 'HK', name: 'Hoàn Kiếm' }] };
    const wardsData = { Q1: [{ id: 'BT', name: 'Bến Thành' }], HK: [{ id: 'HG', name: 'Hàng Gai' }] };

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
                if (handleAvatarUpdate) {
                    const preview = data.avatarUrl ? `${process.env.REACT_APP_API_BASE_URL_FOR_FILES}${data.avatarUrl}` : null;
                    handleAvatarUpdate(preview, data.firstName);
                }
            } catch (error) {
                setApiMessage({ type: 'error', text: 'Không thể tải thông tin hồ sơ.' });
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfile();
    }, [handleAvatarUpdate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
        if (apiMessage) setApiMessage(null);
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null}));
    };

    const handleAvatarFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 200 * 1024) {
                setApiMessage({ type: 'error', text: 'Kích thước file quá lớn (tối đa 200KB).' });
                return;
            }
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
            if (!allowedTypes.includes(file.type.toLowerCase())) {
                setApiMessage({ type: 'error', text: 'Định dạng file không hợp lệ (.jpeg, .jpg, .png, .gif).' });
                return;
            }
            setAvatarFile(file);
            const previewUrl = URL.createObjectURL(file);
            if (handleAvatarUpdate) {
                handleAvatarUpdate(previewUrl, profile.firstName);
            }
            setApiMessage(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setApiMessage(null);
        try {
            let newAvatarUrl = profile.avatarUrl;
            if (avatarFile) {
                const formData = new FormData();
                formData.append('file', avatarFile);
                const avatarResponse = await uploadAvatar(formData);
                newAvatarUrl = avatarResponse.avatarUrl;
            }

            const profileToUpdate = {
                firstName: profile.firstName,
                lastName: profile.lastName,
                phoneNumber: profile.phoneNumber,
                province: profile.province,
                district: profile.district,
                ward: profile.ward,
                streetAddress: profile.streetAddress,
                avatarUrl: newAvatarUrl,
            };
            const updateResponse = await updateUserProfile(profileToUpdate);

            const updatedProfileData = { ...profileToUpdate };
            setProfile(updatedProfileData);
            setInitialProfile(updatedProfileData);
            setAvatarFile(null);

            if (handleAvatarUpdate) {
                const preview = newAvatarUrl ? `${process.env.REACT_APP_API_BASE_URL_FOR_FILES}${newAvatarUrl}` : null;
                handleAvatarUpdate(preview, updatedProfileData.firstName);
            }

            setApiMessage({ type: 'success', text: updateResponse.message || 'Cập nhật hồ sơ thành công!' });
        } catch (error) {
            const errorData = error.response?.data;
            setApiMessage({ type: 'error', text: errorData?.message || errorData?.title || 'Lỗi cập nhật hồ sơ.' });
            if (handleAvatarUpdate) {
                       const oldPreview = initialProfile.avatarUrl ? `${process.env.REACT_APP_API_BASE_URL_FOR_FILES}${initialProfile.avatarUrl}` : null;
                       handleAvatarUpdate(oldPreview, initialProfile.firstName);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const hasChanges = JSON.stringify({ ...profile, avatarUrl: avatarFile ? 'new_file_placeholder' : profile.avatarUrl }) !== JSON.stringify(initialProfile) || !!avatarFile;

    if (isLoading) {
        return <Box sx={{display: 'flex', justifyContent:'center', alignItems:'center', height: '50vh'}}><CircularProgress /></Box>;
    }

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', width:650 }}>
            <input type="file" hidden accept=".jpeg,.jpg,.png,.gif" onChange={handleAvatarFileChange} ref={fileInputRef}/>

            {apiMessage && <Alert severity={apiMessage.type} sx={{ mb: 2 }} onClose={() => setApiMessage(null)}>{apiMessage.text}</Alert>}

            <Grid container spacing={4.5} sx={{ flexGrow: 1 }}>
                {/* Các trường input này sẽ dùng minWidth mặc định là 300px và chia 2 cột trên màn hình lớn */}
                {renderFloatingLabelTextField({ name: "lastName", labelText: "Họ", value: profile.lastName, onChange: handleChange, placeholder: "Nguyễn Văn", disabled: isSubmitting, isRequired: false})}
                {renderFloatingLabelTextField({ name: "firstName", labelText: "Tên", value: profile.firstName, onChange: handleChange, placeholder: "A", disabled: isSubmitting, isRequired: false})}

                {renderFloatingLabelTextField({
                    name: "phoneNumber", labelText: "Số điện thoại", value: profile.phoneNumber, onChange: handleChange,
                    placeholder: "09xxxxxxxx", type: "tel", disabled: isSubmitting, isRequired: false,
                })}
                {renderFloatingLabelSelectField({ name: "province", labelText: "Tỉnh/Thành phố", value: profile.province, onChange: handleChange, options: provincesData, disabled: isSubmitting, isRequired: false})}

                {renderFloatingLabelSelectField({ name: "district", labelText: "Quận/Huyện", value: profile.district, onChange: handleChange, options: districtsData[profile.province] || [], disabled: isSubmitting, isRequired: false })}
                {renderFloatingLabelSelectField({ name: "ward", labelText: "Phường/Xã", value: profile.ward, onChange: handleChange, options: wardsData[profile.district] || [], disabled: isSubmitting, isRequired: false})}

                {/* Ô Địa chỉ: Sẽ chiếm 100% chiều rộng và có minWidth là 300px (theo mặc định của hàm) */}
                {renderFloatingLabelTextField({
                    name: "streetAddress",
                    labelText: "Địa chỉ",
                    value: profile.streetAddress,
                    onChange: handleChange,
                    placeholder: "Số nhà, tên đường...",
                    disabled: isSubmitting,
                    isRequired: false,
                    gridSize: { xs: 12 }, // Chiếm 100% chiều rộng của Grid container
                    boxSx: { minWidth: '310%' } // Ghi đè minWidth của Box để mở rộng hết chiều rộng của Grid item
                })}
            </Grid>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, pt:2, }}>
                <Button
                    type="submit"
                    variant="contained"
                    disabled={isSubmitting || !hasChanges}
                    sx={{ maxWidth: 110, maxHeight:40}}
                    startIcon={isSubmitting ? <CircularProgress size={16} color="inherit"/> : null}
                >
                    {isSubmitting ? "Đang lưu..." : "Cập nhật"}
                </Button>
            </Box>
        </Box>
    );
};

export default UserProfileInfoForm;