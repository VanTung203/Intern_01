// client/src/components/User/UserProfileInfoForm.js
import React, { useState, useEffect, useRef } from 'react';
import { Box, Grid, TextField, Button, Typography, CircularProgress, Select, MenuItem, FormControl, InputLabel, FormHelperText, Alert } from '@mui/material'; // Bỏ Paper, Avatar, IconButton (PhotoCameraIcon)
// import PhotoCameraIcon from '@mui/icons-material/PhotoCamera'; // Bỏ
import { getUserProfile, updateUserProfile, uploadAvatar } from '../../services/userService';
// import { alpha } from '@mui/material/styles'; // Bỏ nếu không dùng
import { useOutletContext } from 'react-router-dom'; // Để nhận context từ Outlet

// --- Giữ nguyên renderFloatingLabelTextField và renderFloatingLabelSelectField ---
const renderFloatingLabelTextField = ({ name, labelText, placeholder, type = 'text', value, onChange, error, disabled, isRequired = false, multiline = false, rows = 1, InputProps, gridSm=12 /* Thêm gridSm default */ }) => (
    // Thêm Grid item bọc ngoài để dễ dàng kiểm soát layout
    <Grid item xs={12} sm={gridSm}>
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
                InputProps={InputProps}
                inputProps={{ style: { paddingTop: '10px', paddingBottom: '10px', fontSize: '0.9rem' } }}
            />
        </Box>
    </Grid>
);

const renderFloatingLabelSelectField = ({ name, labelText, value, onChange, error, disabled, options, isRequired = false, gridSm=12 /* Thêm gridSm default */ }) => (
    <Grid item xs={12} sm={gridSm}>
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
    </Grid>
);


const UserProfileInfoForm = () => {
    const { handleAvatarUpdate } = useOutletContext() || {}; // Nhận context, fallback nếu không có

    const [profile, setProfile] = useState({
        firstName: '', lastName: '', email: '', phoneNumber: '',
        province: '', district: '', ward: '', streetAddress: '', avatarUrl: '' // Vẫn giữ avatarUrl ở đây để quản lý logic
    });
    const [initialProfile, setInitialProfile] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [avatarFile, setAvatarFile] = useState(null);
    // const [avatarPreview, setAvatarPreview] = useState(null); // Không cần preview ở đây nữa
    const [apiMessage, setApiMessage] = useState(null);
    const [errors, setErrors] = useState({});

    const fileInputRef = useRef(null); // Vẫn giữ ref này để gọi input file từ AvatarCard nếu cần (nhưng hiện tại AvatarCard tự quản lý)

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
                if (handleAvatarUpdate) { // Cập nhật AvatarCard khi load lần đầu
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
    }, [handleAvatarUpdate]); // Thêm handleAvatarUpdate vào dependency array

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
        if (apiMessage) setApiMessage(null);
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null}));
    };

    // Hàm này bây giờ sẽ được gọi từ AvatarCard thông qua input file của nó
    // Hoặc nếu muốn UserProfileInfoForm vẫn quản lý input file:
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
            // setAvatarPreview(previewUrl); // Không cần set state preview ở đây nữa
            if (handleAvatarUpdate) {
                handleAvatarUpdate(previewUrl, profile.firstName); // Cập nhật AvatarCard
            }
            setApiMessage(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setApiMessage(null);
        try {
            let newAvatarUrl = profile.avatarUrl; // Giữ avatarUrl hiện tại
            if (avatarFile) {
                const formData = new FormData();
                formData.append('file', avatarFile);
                const avatarResponse = await uploadAvatar(formData); // Giả sử API trả về { avatarUrl: "new/path/to/image.jpg" }
                newAvatarUrl = avatarResponse.avatarUrl; // Cập nhật newAvatarUrl nếu có file mới
            }

            const profileToUpdate = {
                firstName: profile.firstName,
                lastName: profile.lastName,
                phoneNumber: profile.phoneNumber,
                province: profile.province,
                district: profile.district,
                ward: profile.ward,
                streetAddress: profile.streetAddress,
                avatarUrl: newAvatarUrl, // Gửi avatarUrl (mới hoặc cũ) lên API update
            };
            const updateResponse = await updateUserProfile(profileToUpdate);


            // Cập nhật state sau khi thành công
            const updatedProfileData = { ...profileToUpdate }; // Profile đã được gửi đi
            setProfile(updatedProfileData);
            setInitialProfile(updatedProfileData); // Cập nhật initial state để nút Cập nhật disable đúng
            setAvatarFile(null); // Reset avatar file đã chọn

            if (handleAvatarUpdate) { // Cập nhật lại AvatarCard với URL từ server (nếu có thay đổi)
                const preview = newAvatarUrl ? `${process.env.REACT_APP_API_BASE_URL_FOR_FILES}${newAvatarUrl}` : null;
                handleAvatarUpdate(preview, updatedProfileData.firstName);
            }

            setApiMessage({ type: 'success', text: updateResponse.message || 'Cập nhật hồ sơ thành công!' });
        } catch (error) {
            const errorData = error.response?.data;
            setApiMessage({ type: 'error', text: errorData?.message || errorData?.title || 'Lỗi cập nhật hồ sơ.' });
            // Nếu lỗi, có thể muốn revert AvatarCard về trạng thái cũ
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
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', height: '100%', width:400 /* Để form chiếm hết chiều cao card */ }}>
            {/* Input file ẩn, AvatarCard sẽ trigger nó nếu cần, hoặc tạo 1 nút riêng trong UserProfileInfoForm nếu không muốn click avatar để tải */}
            <input type="file" hidden accept=".jpeg,.jpg,.png,.gif" onChange={handleAvatarFileChange} ref={fileInputRef}/>

            {apiMessage && <Alert severity={apiMessage.type} sx={{ mb: 2 }} onClose={() => setApiMessage(null)}>{apiMessage.text}</Alert>}

            {/* Bỏ phần Avatar Grid item ở đây */}
            {/* <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}> ... </Grid> */}

            {/* Cột Form thông tin - Sắp xếp lại layout */}
            {/* Bỏ Paper bọc ngoài vì nó đã được bọc bởi Paper trong UserProfilePage */}
            <Grid container spacing={2.5} sx={{ flexGrow: 1 /* Để grid chiếm không gian còn lại */ }}>
                {/* Các trường input sẽ được render trong Grid items */}
                {renderFloatingLabelTextField({ name: "lastName", labelText: "Họ", value: profile.lastName, onChange: handleChange, placeholder: "Nguyễn Văn", disabled: isSubmitting, isRequired: true, gridSm: 6 })}
                {renderFloatingLabelTextField({ name: "firstName", labelText: "Tên", value: profile.firstName, onChange: handleChange, placeholder: "A", disabled: isSubmitting, isRequired: true, gridSm: 6 })}

                {renderFloatingLabelTextField({
                    name: "phoneNumber", labelText: "Số điện thoại", value: profile.phoneNumber, onChange: handleChange,
                    placeholder: "09xxxxxxxx", type: "tel", disabled: isSubmitting, isRequired: false, gridSm: 6,
                    // InputProps cho icon cờ (sẽ cần component như MuiTelInput)
                    // InputProps={{
                    //     startAdornment: (
                    //         <InputAdornment position="start">
                    //            <img src="/path/to/vietnam_flag.png" alt="VN" style={{width: 20, marginRight: 5}} />
                    //         </InputAdornment>
                    //     ),
                    // }}
                })}
                {renderFloatingLabelSelectField({ name: "province", labelText: "Tỉnh/Thành phố", value: profile.province, onChange: handleChange, options: provincesData, disabled: isSubmitting, isRequired: false, gridSm: 6 })}

                {renderFloatingLabelSelectField({ name: "district", labelText: "Quận/Huyện", value: profile.district, onChange: handleChange, options: districtsData[profile.province] || [], disabled: isSubmitting, isRequired: false, gridSm: 6 })}
                {renderFloatingLabelSelectField({ name: "ward", labelText: "Phường/Xã", value: profile.ward, onChange: handleChange, options: wardsData[profile.district] || [], disabled: isSubmitting, isRequired: false, gridSm: 6 })}

                {renderFloatingLabelTextField({ name: "streetAddress", labelText: "Địa chỉ", value: profile.streetAddress, onChange: handleChange, placeholder: "Số nhà, tên đường...", multiline: true, rows: 3, disabled: isSubmitting, isRequired: false, gridSm: 12 })}
            </Grid>

            {/* Nút Cập nhật - Căn phải và cách đều */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, pt:2, borderTop: theme => `1px solid ${theme.palette.divider}` /* Đường kẻ phân cách nếu muốn */ }}>
                <Button
                    type="submit"
                    variant="contained"
                    disabled={isSubmitting || !hasChanges}
                    sx={{
                        // Style cho nút giữ nguyên hoặc tùy chỉnh
                        minWidth: 120, // Để nút có kích thước phù hợp
                    }}
                    startIcon={isSubmitting ? <CircularProgress size={16} color="inherit"/> : null}
                >
                    {isSubmitting ? "Đang lưu..." : "Cập nhật"}
                </Button>
            </Box>
        </Box>
    );
};

export default UserProfileInfoForm;