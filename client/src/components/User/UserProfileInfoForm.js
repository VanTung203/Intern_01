// client/src/components/User/UserProfileInfoForm.js
import React, { useState, useEffect } from 'react';
import { Box, Grid, TextField, Button, Typography, CircularProgress, Select, MenuItem, FormControl, FormHelperText, Alert } from '@mui/material';
import { getUserProfile, updateUserProfile, uploadAvatar } from '../../services/userService';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios'; // Import axios để gọi API

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
                    {options.map((option) => ( <MenuItem key={option.code} value={option.code}> {option.name} </MenuItem>))}
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

    // // Dữ liệu địa chỉ giả định
    // const provincesData = [{ id: 'HCM', name: 'TP. Hồ Chí Minh' }, { id: 'HN', name: 'Hà Nội' }];
    // const districtsData = { HCM: [{ id: 'Q1', name: 'Quận 1' }], HN: [{ id: 'HK', name: 'Hoàn Kiếm' }] };
    // const wardsData = { Q1: [{ id: 'BT', name: 'Bến Thành' }], HK: [{ id: 'HG', name: 'Hàng Gai' }] };

    // THÊM STATE CHO DỮ LIỆU ĐỊA CHỈ TỪ API
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);

    // --- HÀM TẠO URL ĐẦY ĐỦ CHO AVATAR ---
    const getFullAvatarUrl = (relativePath) => {
        if (!relativePath) {
            return null;
        }
        // REACT_APP_API_BASE_URL_FOR_FILES là biến môi trường trỏ đến http://localhost:5116
        // Nó sẽ nối 'http://localhost:5116' với '/avatars/filename.jpg'
        return `${process.env.REACT_APP_API_BASE_URL_FOR_FILES}${relativePath}`;
    };

    // TÍCH HỢP API VÀO CÁC `useEffect`

    // 1. useEffect: Lấy danh sách Tỉnh/Thành phố và dữ liệu profile người dùng CÙNG LÚC
    useEffect(() => {
        const fetchInitialData = async () => {
            setIsLoading(true);
            try {
                // Gọi cả hai API song song để tiết kiệm thời gian
                const [provincesRes, profileRes] = await Promise.all([
                    axios.get('https://provinces.open-api.vn/api/p/'),
                    getUserProfile()
                ]);

                const loadedProvinces = provincesRes.data;
                setProvinces(loadedProvinces);
                
                // Tìm mã code tương ứng với tên đã lưu trong profile
                const provinceCode = loadedProvinces.find(p => p.name === profileRes.province)?.code || '';
                
                // Cập nhật state của form với mã code
                const profileWithCodes = {
                    ...profileRes,
                    provinceCode: provinceCode,
                    districtCode: '', // Sẽ được load sau
                    wardCode: '',     // Sẽ được load sau
                };

                setProfile(profileWithCodes);
                setInitialProfile(profileWithCodes);

                if (handleInfoUpdate) {
                    handleInfoUpdate(getFullAvatarUrl(profileRes.avatarUrl), profileRes.firstName);
                }

            } catch (error) {
                console.error("Lỗi khi tải dữ liệu ban đầu:", error);
                setApiMessage({ type: 'error', text: 'Không thể tải thông tin hồ sơ.' });
            } finally {
                setIsLoading(false);
            }
        };

        fetchInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Chỉ chạy một lần khi component được mount


    // 2. useEffect: Lấy Quận/Huyện khi provinceCode thay đổi HOẶC khi danh sách tỉnh đã load xong
    useEffect(() => {
        const fetchDistricts = async () => {
            if (profile.provinceCode) {
                try {
                    const response = await axios.get(`https://provinces.open-api.vn/api/p/${profile.provinceCode}?depth=2`);
                    const loadedDistricts = response.data.districts;
                    setDistricts(loadedDistricts);

                    // Khôi phục lựa chọn quận nếu có trong dữ liệu ban đầu
                    const districtCode = loadedDistricts.find(d => d.name === initialProfile.district)?.code || '';
                    if (districtCode) {
                        setProfile(p => ({...p, districtCode: districtCode}));
                    }
                } catch (error) {
                    console.error("Lỗi khi tải danh sách quận/huyện:", error);
                }
            }
        };
        fetchDistricts();
    }, [profile.provinceCode, initialProfile.district]);


    // 3. useEffect: Lấy Phường/Xã khi districtCode thay đổi HOẶC khi danh sách huyện đã load xong
    useEffect(() => {
        const fetchWards = async () => {
            if (profile.districtCode) {
                try {
                    const response = await axios.get(`https://provinces.open-api.vn/api/d/${profile.districtCode}?depth=2`);
                    const loadedWards = response.data.wards;
                    setWards(loadedWards);

                    // Khôi phục lựa chọn phường/xã nếu có trong dữ liệu ban đầu
                    const wardCode = loadedWards.find(w => w.name === initialProfile.ward)?.code || '';
                    if (wardCode) {
                         setProfile(p => ({...p, wardCode: wardCode}));
                    }
                } catch (error) {
                    console.error("Lỗi khi tải danh sách phường/xã:", error);
                }
            }
        };
        fetchWards();
    }, [profile.districtCode, initialProfile.ward]);

    // Fetch dữ liệu profile ban đầu
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
    }, []); // Chỉ chạy 1 lần, bỏ handleInfoUpdate để tránh vòng lặp
    
    // Gửi tên lên component cha mỗi khi thay đổi [TẠM THỜI XÓA ĐOẠN CODE]
    // useEffect(() => {
    //     if(handleInfoUpdate && profile.firstName !== initialProfile.firstName) {
    //         handleInfoUpdate(
    //             profile.avatarUrl ? `${process.env.REACT_APP_API_BASE_URL_FOR_FILES}${profile.avatarUrl}` : null,
    //             profile.firstName
    //         );
    //     }
    // }, [profile.firstName, profile.avatarUrl, initialProfile.firstName, handleInfoUpdate]);


    // Sửa đổi handleChange để làm việc với mã code
    const handleChange = (e) => {
        const { name, value } = e.target;
        const newProfile = { ...profile, [name]: value };

        if (name === 'provinceCode') {
            newProfile.districtCode = '';
            newProfile.wardCode = '';
            setDistricts([]);
            setWards([]);
        }
        if (name === 'districtCode') {
            newProfile.wardCode = '';
            setWards([]);
        }

        setProfile(newProfile);

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

            if (avatarFile) {
                const formData = new FormData();
                formData.append('file', avatarFile);
                const avatarResponse = await uploadAvatar(formData);
                // Giả sử API trả về { filePath: 'path/to/new/avatar.png' }
                newAvatarPath = avatarResponse.filePath; 
            }

            // --- SỬA Ở ĐÂY: Dùng `provinceCode` để tìm tên ---
            const provinceName = provinces.find(p => p.code === profile.provinceCode)?.name || '';
            const districtName = districts.find(d => d.code === profile.districtCode)?.name || '';
            const wardName = wards.find(w => w.code === profile.wardCode)?.name || '';

            // Nếu backend lưu mã (code) thì gửi profile.province, profile.district...
            // Nếu backend lưu tên thì gửi provinceName, districtName...
            // Ở đây giả sử backend lưu tên
            const profileToUpdate = {
                firstName: profile.firstName,
                lastName: profile.lastName,
                phoneNumber: profile.phoneNumber,
                province: provinceName,
                district: districtName,
                ward: wardName,
                streetAddress: profile.streetAddress,
                avatarUrl: newAvatarPath, // Sử dụng đường dẫn avatar mới (nếu có)
            };
            
            // Gọi API cập nhật thông tin người dùng
            const updateResponse = await updateUserProfile(profileToUpdate);

            // Cập nhật state thành công
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
                {renderFloatingLabelSelectField({ name: "provinceCode", labelText: "Tỉnh/Thành phố", value: profile.provinceCode, onChange: handleChange, options: provinces, disabled: isSubmitting })}
                {renderFloatingLabelSelectField({ name: "districtCode", labelText: "Quận/Huyện", value: profile.districtCode, onChange: handleChange, options: districts, disabled: !profile.provinceCode || isSubmitting })}
                {renderFloatingLabelSelectField({ name: "wardCode", labelText: "Phường/Xã", value: profile.wardCode, onChange: handleChange, options: wards, disabled: !profile.districtCode || isSubmitting })}
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