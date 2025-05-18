// client/src/components/User/UserProfileInfoForm.js
import React, { useState, useEffect, useRef } from 'react';
import { Box, Grid, TextField, Button, Typography, Paper, Avatar, CircularProgress, Select, MenuItem, FormControl, InputLabel, IconButton, FormHelperText, Alert } from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { getUserProfile, updateUserProfile, uploadAvatar } from '../../services/userService'; // Đảm bảo service này tồn tại và đúng
import { alpha } from '@mui/material/styles';

// Hàm helper renderTextField với label nổi (nếu bạn muốn style này)
// Hoặc sử dụng TextField với prop 'label' trực tiếp cho style mặc định của MUI
const renderFloatingLabelTextField = ({ name, labelText, placeholder, type = 'text', value, onChange, error, disabled, isRequired = false, multiline = false, rows = 1, InputProps }) => (
    <Box sx={{ position: 'relative', width: '100%' }}>
        <Typography
            variant="caption" component="label" htmlFor={name}
            sx={{ position: 'absolute', top: '-9px', left: '12px', backgroundColor: (theme) => theme.palette.background.paper, px: '5px', fontSize: '11.5px', color: error ? 'error.main' : 'text.secondary', fontWeight: 500, zIndex: 1 }}
        >
            {labelText} {isRequired && '*'}
        </Typography>
        <TextField
            required={isRequired} margin="none" fullWidth id={name} name={name} type={type}
            placeholder={placeholder} value={value || ''} onChange={onChange}
            error={!!error} helperText={error || ''} disabled={disabled} size="small"
            multiline={multiline} rows={rows}
            InputProps={InputProps} // Cho các adornment nếu có
            inputProps={{ style: { paddingTop: '10px', paddingBottom: '10px', fontSize: '0.9rem' } }}
        />
    </Box>
);

// Placeholder cho Select, bạn sẽ cần API để lấy dữ liệu Tỉnh/Thành, Quận/Huyện, Phường/Xã
const renderFloatingLabelSelectField = ({ name, labelText, value, onChange, error, disabled, options, isRequired = false }) => (
    <Box sx={{ position: 'relative', width: '100%' }}>
        <Typography
            variant="caption" component="label" htmlFor={name}
            sx={{ position: 'absolute', top: '-9px', left: '12px', backgroundColor: (theme) => theme.palette.background.paper, px: '5px', fontSize: '11.5px', color: error ? 'error.main' : 'text.secondary', fontWeight: 500, zIndex: 1 }}
        >
            {labelText} {isRequired && '*'}
        </Typography>
        <FormControl fullWidth size="small" error={!!error} disabled={disabled}>
            <Select
                id={name} name={name} value={value || ''} onChange={onChange}
                displayEmpty
                inputProps={{ style: { paddingTop: '10px', paddingBottom: '10px', fontSize: '0.9rem' } }}
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
);


const UserProfileInfoForm = () => {
    const [profile, setProfile] = useState({
        firstName: '', lastName: '', email: '', phoneNumber: '',
        province: '', district: '', ward: '', streetAddress: '', avatarUrl: ''
    });
    const [initialProfile, setInitialProfile] = useState({}); // Để so sánh xem có thay đổi không
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [apiMessage, setApiMessage] = useState(null); // {type, text}
    const [errors, setErrors] = useState({}); // Cho validation client-side nếu cần

    const fileInputRef = useRef(null);

    // --- Dữ liệu giả lập cho dropdown địa chỉ ---
    // TRONG THỰC TẾ, BẠN SẼ LẤY DỮ LIỆU NÀY TỪ API
    const provincesData = [{ id: 'HCM', name: 'TP. Hồ Chí Minh' }, { id: 'HN', name: 'Hà Nội' }];
    const districtsData = { HCM: [{ id: 'Q1', name: 'Quận 1' }], HN: [{ id: 'HK', name: 'Hoàn Kiếm' }] };
    const wardsData = { Q1: [{ id: 'BT', name: 'Bến Thành' }], HK: [{ id: 'HG', name: 'Hàng Gai' }] };
    // --- Kết thúc dữ liệu giả lập ---

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
                setInitialProfile(initialData); // Lưu trạng thái ban đầu
                if (data.avatarUrl) {
                    setAvatarPreview(`${process.env.REACT_APP_API_BASE_URL_FOR_FILES}${data.avatarUrl}`);
                }
            } catch (error) {
                setApiMessage({ type: 'error', text: 'Không thể tải thông tin hồ sơ.' });
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
        if (apiMessage) setApiMessage(null);
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null}));
    };

    const handleAvatarChange = (e) => {
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
            setAvatarPreview(URL.createObjectURL(file));
            setApiMessage(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setApiMessage(null);
        // TODO: Thêm validation client-side nếu cần
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
                // avatarUrl sẽ được cập nhật bởi logic riêng nếu backend yêu cầu
                // Hoặc nếu API updateUserProfile có nhận avatarUrl:
                // avatarUrl: newAvatarUrl,
            };
            const updateResponse = await updateUserProfile(profileToUpdate);

            // Nếu upload avatar thành công và API update profile không nhận avatarUrl,
            // có thể bạn cần gọi lại fetchProfile để lấy avatarUrl mới nhất
            // Hoặc nếu API update trả về profile mới nhất thì dùng nó
            setProfile(prev => ({...prev, avatarUrl: newAvatarUrl}));
            setInitialProfile(prev => ({...prev, ...profileToUpdate, avatarUrl: newAvatarUrl})); // Cập nhật initial state
            setAvatarFile(null); // Reset avatar file

            setApiMessage({ type: 'success', text: updateResponse.message || 'Cập nhật hồ sơ thành công!' });
        } catch (error) {
            const errorData = error.response?.data;
            setApiMessage({ type: 'error', text: errorData?.message || errorData?.title || 'Lỗi cập nhật hồ sơ.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Kiểm tra xem có thay đổi nào không để enable nút Cập nhật
    const hasChanges = JSON.stringify(profile) !== JSON.stringify(initialProfile) || !!avatarFile;

    if (isLoading) {
        return <Box sx={{display: 'flex', justifyContent:'center', alignItems:'center', height: '50vh'}}><CircularProgress /></Box>;
    }

    return (
        <Box component="form" onSubmit={handleSubmit}>
            {apiMessage && <Alert severity={apiMessage.type} sx={{ mb: 2 }} onClose={() => setApiMessage(null)}>{apiMessage.text}</Alert>}
            <Grid container spacing={3}>
                {/* Cột Avatar */}
                <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Paper sx={{ p: 2.5, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', borderRadius: '12px', border: theme => `1px dashed ${theme.palette.divider}` }}>
                        <Avatar
                            src={avatarPreview || (profile.avatarUrl ? `${process.env.REACT_APP_API_BASE_URL_FOR_FILES}${profile.avatarUrl}` : undefined)}
                            sx={{ width: 144, height: 144, mb: 2, fontSize:'3rem' }}
                        >
                            {(!avatarPreview && !profile.avatarUrl && profile.firstName) ? profile.firstName.charAt(0).toUpperCase() : null}
                        </Avatar>
                        <Button
                            variant="outlined"
                            component="label"
                            size="small"
                            startIcon={<PhotoCameraIcon sx={{fontSize: '1rem'}}/>}
                            disabled={isSubmitting}
                            sx={{textTransform:'none', fontSize:'0.8rem', color:'text.primary', borderColor:'grey.400'}}
                        >
                            Tải ảnh lên
                            <input type="file" hidden accept=".jpeg,.jpg,.png,.gif" onChange={handleAvatarChange} ref={fileInputRef}/>
                        </Button>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, textAlign: 'center', fontSize:'11px' }}>
                            *.jpeg, *.jpg, *.png, *.gif
                            <br />
                            kích thước tối đa 200 Kb
                        </Typography>
                    </Paper>
                </Grid>

                {/* Cột Form thông tin */}
                <Grid item xs={12} md={8}>
                     <Paper sx={{ p: {xs:2, sm:3}, borderRadius: '12px', border: theme => `1px solid ${theme.palette.divider}` }}>
                        <Grid container spacing={2}>
                            {renderFloatingLabelTextField({ name: "lastName", labelText: "Họ", value: profile.lastName, onChange: handleChange, placeholder: "Nguyễn Văn", disabled: isSubmitting, isRequired: true, gridSm:6 })}
                            {renderFloatingLabelTextField({ name: "firstName", labelText: "Tên", value: profile.firstName, onChange: handleChange, placeholder: "A", disabled: isSubmitting, isRequired: true, gridSm:6 })}
                            {renderFloatingLabelTextField({ name: "phoneNumber", labelText: "Số điện thoại", value: profile.phoneNumber, onChange: handleChange, placeholder: "09xxxxxxxx", type: "tel", disabled: isSubmitting, isRequired: false, gridSm:6 })}
                            {renderFloatingLabelSelectField({ name: "province", labelText: "Tỉnh/Thành phố", value: profile.province, onChange: handleChange, options: provincesData, disabled: isSubmitting, isRequired: false, gridSm:6 })}
                            {renderFloatingLabelSelectField({ name: "district", labelText: "Quận/Huyện", value: profile.district, onChange: handleChange, options: districtsData[profile.province] || [], disabled: isSubmitting, isRequired: false, gridSm:6 })}
                            {renderFloatingLabelSelectField({ name: "ward", labelText: "Phường/Xã", value: profile.ward, onChange: handleChange, options: wardsData[profile.district] || [], disabled: isSubmitting, isRequired: false, gridSm:6 })}
                            {renderFloatingLabelTextField({ name: "streetAddress", labelText: "Địa chỉ", value: profile.streetAddress, onChange: handleChange, placeholder: "Số nhà, tên đường...", multiline: true, rows: 3, disabled: isSubmitting, isRequired: false, gridSm:12 })}

                            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', mt:1 }}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    disabled={isSubmitting || !hasChanges} // Disable nếu đang gửi hoặc không có thay đổi
                                    sx={{
                                        backgroundColor: !hasChanges || isSubmitting ? 'grey.300' : 'primary.main', // Màu xám khi disable
                                        color: !hasChanges || isSubmitting ? 'text.disabled' : 'primary.contrastText',
                                        '&:hover': {
                                            backgroundColor: !hasChanges || isSubmitting ? 'grey.300' : 'primary.dark',
                                        }
                                    }}
                                    startIcon={isSubmitting ? <CircularProgress size={16} color="inherit"/> : null}
                                >
                                    {isSubmitting ? "Đang lưu..." : "Cập nhật"}
                                </Button>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default UserProfileInfoForm;