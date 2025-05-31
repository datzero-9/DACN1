import React, { useEffect, useRef, useState } from 'react';
import { Picker } from "@react-native-picker/picker";
import DropDownPicker from "react-native-dropdown-picker";
import {
    View,
    Text,
    TextInput,
    ScrollView,
    TouchableOpacity,
    Animated,
    Easing,
    Alert,
    Image,
    ActivityIndicator,
    Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { useUser } from '@clerk/clerk-expo';

interface CloudinaryUploadResponse {
    secure_url: string;
}

type Address = {
    id: string;
    name: string;
};

interface Item {
    _id: string;
    demand: string;
    category: string;
    land_area: string;
    price: number;
    price_unit: string;
    bedroom: number;
    bathroom: number;
    floor: number;
    list_images: string[];
    address: string;
    title: string;
    description: string;
    phone_number: string;
}

const hostID = process.env.EXPO_PUBLIC_LOCAL_HOST_ID;

export default function EditDetail() {
    const router = useRouter();
    const { user } = useUser();
    const params = useLocalSearchParams();

    // Dữ liệu ban đầu
    const [initialData, setInitialData] = useState<Item | null>(null);
    // Flag để set data lần đầu
    const [isInitialSet, setIsInitialSet] = useState(false);

    useEffect(() => {
        if (params.data) {
            try {
                const parsed = JSON.parse(params.data as string) as Item;
                setInitialData(parsed);
            } catch (error) {
                console.error("Lỗi parse initialData:", error);
            }
        }
    }, [params.data]);

    // Dropdown Nhu cầu
    const [selected, setSelected] = useState('Bán');
    const [showOptions, setShowOptions] = useState(false);
    const options = [
        { id: 1, label: 'Bán', icon: 'cash-outline' },
        { id: 2, label: 'Cho thuê', icon: 'key-outline' },
    ];
    const dropdownHeight = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(dropdownHeight, {
            toValue: showOptions ? options.length * 40 : 0,
            duration: 200,
            easing: Easing.out(Easing.ease),
            useNativeDriver: false,
        }).start();
    }, [showOptions]);

    // Các state form
    const [bedroom, setBedroom] = useState(0);
    const [bathroom, setBathroom] = useState(0);
    const [floor, setFloor] = useState(0);
    const [landArea, setLandArea] = useState('');
    const [price, setPrice] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [imageUrls, setImageUrls] = useState<string[]>([]);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [priceUnit, setPriceUnit] = useState('');
    const [unitOpen, setUnitOpen] = useState(false);
    const [unitItems, setUnitItems] = useState([
        { label: "Tỷ", value: "Tỷ" },
        { label: "Triệu", value: "Triệu" },
    ]);
    const [open, setOpen] = useState(false);
    const [cateLand, setCateLand] = useState('');
    const [items, setItems] = useState([
        { label: "Đất thổ cư", value: "Đất thổ cư" },
        { label: "Đất nông nghiệp", value: "Đất nông nghiệp" },
        { label: "Đất công nghiệp", value: "Đất công nghiệp" },
        { label: "Đất nền dự án", value: "Đất nền dự án" },
    ]);

    // Địa chỉ
    const [provinces, setProvinces] = useState<Address[]>([]);
    const [districts, setDistricts] = useState<Address[]>([]);
    const [wards, setWards] = useState<Address[]>([]);
    const [street, setStreet] = useState('');
    const [tinhTP, setTinhTP] = useState('');
    const [quanHuyen, setQuanHuyen] = useState('');
    const [phuongXa, setPhuongXa] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Load tỉnh/thành phố
    useEffect(() => {
        getProvinces();
    }, []);

    // Lần đầu set dữ liệu form từ initialData, tránh set lại mỗi lần provinces/districts thay đổi
    useEffect(() => {
        if (initialData && !isInitialSet) {
            setSelected(initialData.demand);
            setCateLand(initialData.category);
            setLandArea(initialData.land_area);
            setPrice(initialData.price.toString());
            setPriceUnit(initialData.price_unit);
            setBedroom(initialData.bedroom);
            setBathroom(initialData.bathroom);
            setFloor(initialData.floor);
            setImageUrls(initialData.list_images);
            setPhoneNumber(initialData.phone_number);
            setTitle(initialData.title);
            setDescription(initialData.description);

            const parts = initialData.address.split(',').map(p => p.trim());
            setStreet(parts[0] || '');
            setPhuongXa(parts[1] || '');
            setQuanHuyen(parts[2] || '');
            setTinhTP(parts[3] || '');

            setIsInitialSet(true);
        }
    }, [initialData, isInitialSet]);

    // Load districts khi chọn tỉnh
    useEffect(() => {
        if (!tinhTP) {
            setDistricts([]);
            setQuanHuyen('');
            return;
        }
        const prov = provinces.find(p => p.name === tinhTP);
        if (prov) getDistricts(prov.id);
    }, [tinhTP]);

    // Load wards khi chọn huyện
    useEffect(() => {
        if (!quanHuyen) {
            setWards([]);
            setPhuongXa('');
            return;
        }
        const dist = districts.find(d => d.name === quanHuyen);
        if (dist) getWards(dist.id);
    }, [quanHuyen]);

    const getProvinces = async () => {
        try {
            const res = await axios.get(`https://open.oapi.vn/location/provinces?page=0&size=70`);
            setProvinces(res.data.data);
        } catch (err) {
            console.log("Lỗi lấy tỉnh/thành phố:", err);
        }
    };

    const getDistricts = async (provinceId: string) => {
        try {
            const res = await axios.get(`https://open.oapi.vn/location/districts/${provinceId}?page=0&size=70`);
            setDistricts(res.data.data);
        } catch (err) {
            console.log("Lỗi lấy quận/huyện:", err);
        }
    };

    const getWards = async (districtId: string) => {
        try {
            const res = await axios.get(`https://open.oapi.vn/location/wards/${districtId}?page=0&size=70`);
            setWards(res.data.data);
        } catch (err) {
            console.log("Lỗi lấy phường/xã:", err);
        }
    };

    // Upload ảnh Cloudinary
    const pickImages = async (): Promise<void> => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
            alert("Permission to access photos is required!");
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            quality: 1,
        });
        if (!result.canceled) {
            uploadMultipleImages(result.assets);
        }
    };

    const uploadImgToCloudinary = async (image: ImagePicker.ImagePickerAsset): Promise<string | null> => {
        const data = new FormData();
        data.append('file', {
            uri: image.uri,
            name: 'upload.jpg',
            type: 'image/jpeg',
        } as any);
        data.append('upload_preset', 'nxl7uozr');
        try {
            const res = await axios.post<CloudinaryUploadResponse>(
                'https://api.cloudinary.com/v1_1/dfv0n3vas/image/upload',
                data,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );
            return res.data.secure_url;
        } catch (error) {
            console.error('Upload failed:', error);
            return null;
        }
    };

    const uploadMultipleImages = async (images: ImagePicker.ImagePickerAsset[]): Promise<void> => {
        setImageUrls([]);
        const urls = await Promise.all(images.map(img => uploadImgToCloudinary(img)));
        setImageUrls(urls.filter((url): url is string => Boolean(url)));
    };

    // Cập nhật bài viết
    const handleUpdate = async () => {
        if (!selected) return Alert.alert("Thiếu thông tin", "Vui lòng chọn nhu cầu.");
        if (!cateLand) return Alert.alert("Thiếu thông tin", "Vui lòng chọn loại bất động sản.");
        if (!landArea) return Alert.alert("Thiếu thông tin", "Vui lòng nhập diện tích.");
        if (!price) return Alert.alert("Thiếu thông tin", "Vui lòng nhập giá.");
        if (!title) return Alert.alert("Thiếu thông tin", "Vui lòng nhập tiêu đề.");
        if (!description) return Alert.alert("Thiếu thông tin", "Vui lòng nhập mô tả.");
        if (imageUrls.length === 0) return Alert.alert("Thiếu thông tin", "Vui lòng thêm ít nhất một hình ảnh.");
        if (!phoneNumber) return Alert.alert("Thiếu thông tin", "Vui lòng nhập số điện thoại.");
        if (!priceUnit) return Alert.alert("Thiếu thông tin", "Vui lòng chọn đơn vị giá.");

        if (!initialData?._id) {
            Alert.alert("Lỗi", "Không có ID bài viết để cập nhật.");
            return;
        }

        const updatePayload = {
            demand: selected,
            category: cateLand,
            land_area: landArea,
            price: Number(price),
            bedroom,
            bathroom,
            floor,
            list_images: imageUrls,
            address: `${street}, ${phuongXa}, ${quanHuyen}, ${tinhTP}`,
            title,
            description,
            price_unit: priceUnit,
            phone_number: phoneNumber,
        };
        console.log("Update payload:", updatePayload);
        try {
            setIsLoading(true);
            await axios.put(`${hostID}:80/api/updateHouse/${initialData._id}`, updatePayload);
            Alert.alert("Cập nhật thành công!", "Bài viết của bạn đã được cập nhật!!!", [
                { text: "OK", onPress: () => router.back() }
            ]);
        } catch (error) {
            console.error("Lỗi cập nhật bài viết:", error);
            Alert.alert("Lỗi", "Cập nhật bài viết không thành công.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white m-0 p-0">
            {/* Header */}
            <View style={{ backgroundColor: 'red' }} className='p-2 flex-row items-center justify-between px-4 border-t border-gray-200'>
                <Text className="text-xl text-white font-bold ">Sửa tin đăng</Text>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text className="text-white text-sm font-medium border-white border rounded-3xl px-3 py-1">Thoát</Text>
                </TouchableOpacity>
            </View>

            {/* Loading */}
            {isLoading && (
                <Modal visible transparent animationType="fade">
                    <View className="flex-1 justify-center items-center bg-black/60">
                        <View className="bg-zinc-800 px-6 py-4 rounded-xl items-center">
                            <ActivityIndicator size="large" color="#fff" />
                            <Text className="text-white mt-2 text-base">Đang tải...</Text>
                        </View>
                    </View>
                </Modal>
            )}

            <ScrollView className="p-4 bg-gray-100">
                {/* Nhu cầu */}
                <View className="bg-white p-4 rounded-2xl mb-4">
                    <Text className="font-medium mb-1">Nhu cầu</Text>
                    <TouchableOpacity
                        onPress={() => setShowOptions(!showOptions)}
                        className="border border-gray-300 bg-gray-200 rounded-3xl px-4 py-3 flex-row justify-between items-center"
                    >
                        <Text>{selected}</Text>
                        {showOptions
                            ? <Ionicons name="chevron-up-outline" size={20} />
                            : <Ionicons name="chevron-down-outline" size={20} />}
                    </TouchableOpacity>
                    <Animated.View
                        style={{ height: dropdownHeight, overflow: 'hidden' }}
                        className="flex-row justify-between rounded-md mt-1 bg-white"
                    >
                        {options.map((item) => (
                            <TouchableOpacity
                                key={item.id}
                                onPress={() => {
                                    setSelected(item.label);
                                    setShowOptions(false);
                                }}
                                className="px-4 py-2 border border-gray-300  mx-2 rounded-3xl w-[40%]"
                            >
                                <Ionicons name={item.icon as any} size={30} color="gray" />
                                <Text className='font-medium text-[16px]'>{item.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </Animated.View>
                </View>

                {/* Địa chỉ BĐS */}
                <View className="bg-white p-4 rounded-2xl mb-4">
                    <Text className="font-medium mb-1">Địa chỉ BĐS</Text>
                    <View className="p-4">
                        {/* Tỉnh / Thành phố */}
                        <View>
                            <Text className="font-semibold mb-1">Tỉnh/Thành phố:</Text>
                            <View className="border border-gray-400 rounded bg-white mb-2">
                                <Picker
                                    selectedValue={tinhTP}
                                    onValueChange={(itemValue) => {
                                        const selected = provinces.find((p) => p.id === itemValue);
                                        setTinhTP(selected?.name || "");
                                        getDistricts(itemValue);
                                        setQuanHuyen("");
                                        setPhuongXa("");
                                        setWards([]);
                                    }}
                                >
                                    <Picker.Item label="Chọn Tỉnh/Thành phố" value="" />
                                    {provinces.map((item) => (
                                        <Picker.Item key={item.id} label={item.name} value={item.id} />
                                    ))}
                                </Picker>
                            </View>
                        </View>

                        {/* Quận / Huyện */}
                        <View>
                            <Text className="font-semibold mb-1">Quận/Huyện:</Text>
                            <View className="border border-gray-400 rounded bg-white mb-2">
                                <Picker
                                    selectedValue={quanHuyen}
                                    onValueChange={(itemValue) => {
                                        const selected = districts.find((d) => d.id === itemValue);
                                        setQuanHuyen(selected?.name || "");
                                        getWards(itemValue);
                                        setPhuongXa("");
                                    }}
                                >
                                    <Picker.Item label="Chọn Quận/Huyện" value="" />
                                    {districts.map((item) => (
                                        <Picker.Item key={item.id} label={item.name} value={item.id} />
                                    ))}
                                </Picker>
                            </View>
                        </View>

                        {/* Phường / Xã */}
                        <View>
                            <Text className="font-semibold mb-1">Phường/Xã:</Text>
                            <View className="border border-gray-400 rounded bg-white mb-2">
                                <Picker
                                    selectedValue={phuongXa}
                                    onValueChange={(itemValue) => {
                                        const selected = wards.find((w) => w.id === itemValue);
                                        setPhuongXa(selected?.name || "");
                                    }}
                                >
                                    <Picker.Item label="Chọn Phường/Xã" value="" />
                                    {wards.map((item) => (
                                        <Picker.Item key={item.id} label={item.name} value={item.id} />
                                    ))}
                                </Picker>
                            </View>
                        </View>

                        {/* Tên đường */}
                        <View>
                            <Text className="font-semibold mb-1">Tên đường/ tổ/ ấp:</Text>
                            <TextInput
                                className="border border-gray-300 bg-gray-200 rounded-3xl px-4 py-2 mt-1 mb-3"
                                placeholder="Nhập địa chỉ ở đây"
                                value={street}
                                onChangeText={setStreet}
                            />
                        </View>
                    </View>
                </View>

                {/* Thông tin chính */}
                <View className="bg-white p-4 rounded-2xl mb-4">
                    <Text className="font-medium mb-2">Thông tin chính</Text>
                    <View className="z-50 mb-4">
                        <Text className="text-sm font-medium mb-1">Loại BĐS</Text>
                        <DropDownPicker
                            open={open}
                            value={cateLand}
                            items={items}
                            setOpen={setOpen}
                            setValue={setCateLand}
                            setItems={setItems}
                            placeholder="Chọn loại BĐS"
                            style={{
                                borderRadius: 20,
                                borderColor: "#ccc",
                                backgroundColor: "#f0f0f0",
                                height: 35,
                            }}
                            dropDownContainerStyle={{
                                borderColor: "#ccc",
                                borderRadius: 12,
                            }}
                            textStyle={{
                                fontSize: 14,
                            }}
                        />
                    </View>
                    <View>
                        <Text className="text-sm font-medium">Diện tích (m²)</Text>
                        <TextInput
                            className="border border-gray-300 bg-gray-200 rounded-3xl px-4 py-2 mt-1 mb-3"
                            placeholder="Nhập diện tích "
                            value={landArea}
                            onChangeText={setLandArea}
                        />
                    </View>
                    <View className='flex-row justify-between items-center z-20'>
                        {/* Ô nhập giá */}
                        <View className='w-[65%]'>
                            <Text className="text-sm font-medium mb-1">Mức giá</Text>
                            <TextInput
                                className="border border-gray-300 bg-gray-200 rounded-full px-4 py-2"
                                placeholder="Nhập giá"
                                keyboardType="numeric"
                                value={price}
                                onChangeText={setPrice}
                            />
                        </View>

                        {/* Dropdown đơn vị */}
                        <View className='w-[30%]'>
                            <Text className="text-sm font-medium mb-1">Đơn vị</Text>
                            <DropDownPicker
                                open={unitOpen}
                                value={priceUnit}
                                items={unitItems}
                                setOpen={setUnitOpen}
                                setValue={setPriceUnit}
                                setItems={setUnitItems}
                                placeholder="Đơn vị"
                                style={{
                                    borderRadius: 20,
                                    borderColor: "#ccc",
                                    backgroundColor: "#f0f0f0",
                                    height: 40,
                                }}
                                dropDownContainerStyle={{
                                    borderColor: "#ccc",
                                    borderRadius: 12,
                                    marginTop: 4,
                                    zIndex: 2000,
                                }}
                                textStyle={{
                                    fontSize: 14,
                                }}
                            />
                        </View>
                    </View>
                </View>

                {/* Số phòng ngủ, phòng tắm, số tầng */}
                <View className="bg-white p-4 rounded-2xl mb-4">
                    {/* Số phòng ngủ */}
                    <View className="flex-row justify-between items-center mt-4">
                        <Text className="text-sm font-medium">Số phòng ngủ</Text>
                        <View className="flex-row items-center space-x-3">
                            <TouchableOpacity
                                onPress={() => setBedroom(Math.max(0, bedroom - 1))}
                                className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center"
                            >
                                <Text className="text-xl font-semibold">-</Text>
                            </TouchableOpacity>
                            <Text className="text-base mx-2">{bedroom}</Text>
                            <TouchableOpacity
                                onPress={() => setBedroom(bedroom + 1)}
                                className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center"
                            >
                                <Text className="text-xl font-semibold">+</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Số phòng tắm, vệ sinh */}
                    <View className="flex-row justify-between items-center mt-4">
                        <Text className="text-sm font-medium">Số phòng tắm, vệ sinh</Text>
                        <View className="flex-row items-center space-x-3">
                            <TouchableOpacity
                                onPress={() => setBathroom(Math.max(0, bathroom - 1))}
                                className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center"
                            >
                                <Text className="text-xl font-semibold">-</Text>
                            </TouchableOpacity>
                            <Text className="text-base mx-2">{bathroom}</Text>
                            <TouchableOpacity
                                onPress={() => setBathroom(bathroom + 1)}
                                className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center"
                            >
                                <Text className="text-xl font-semibold">+</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Số tầng */}
                    <View className="flex-row justify-between items-center mt-4">
                        <Text className="text-sm font-medium">Số tầng</Text>
                        <View className="flex-row items-center space-x-3">
                            <TouchableOpacity
                                onPress={() => setFloor(Math.max(0, floor - 1))}
                                className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center"
                            >
                                <Text className="text-xl font-semibold">-</Text>
                            </TouchableOpacity>
                            <Text className="text-base mx-2">{floor}</Text>
                            <TouchableOpacity
                                onPress={() => setFloor(floor + 1)}
                                className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center"
                            >
                                <Text className="text-xl font-semibold">+</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Thông tin liên hệ */}
                <View className="bg-white p-4 rounded-2xl mb-4">
                    <Text className="font-medium mb-2">Thông tin liên hệ</Text>
                    <View>
                        <Text className="text-sm font-medium">Số điện thoại</Text>
                        <TextInput
                            className="border border-gray-300 bg-gray-200 rounded-3xl px-4 py-2 mt-1 mb-3"
                            placeholder="Số điện thoại"
                            keyboardType="phone-pad"
                            value={phoneNumber}
                            onChangeText={setPhoneNumber}
                        />
                    </View>
                </View>

                {/* Tiêu đề & Mô tả */}
                <View className="bg-white p-4 rounded-2xl mb-4">
                    <Text className="font-semibold text-base mb-4">Tiêu đề & Mô tả</Text>
                    <View>
                        <Text className="text-sm font-medium mb-1">Tiêu đề</Text>
                        <TextInput
                            className="border border-gray-300 bg-white text-sm rounded-xl p-3 mb-1"
                            placeholder="Mô tả ngắn gọn về loại hình bất động sản, diện tích, địa chỉ..."
                            multiline
                            value={title}
                            onChangeText={setTitle}
                        />
                        <Text className="text-gray-400 text-xs mb-4">Tối thiểu 30 ký tự, tối đa 99 ký tự</Text>
                    </View>
                    <View>
                        <Text className="text-sm font-medium mb-1">Mô tả</Text>
                        <TextInput
                            className="border border-gray-300 bg-white text-sm rounded-xl p-3"
                            placeholder={`Mô tả chi tiết về:\n• loại hình bất động sản\n• vị trí\n• diện tích, tiện ích\n• tình trạng nội thất\n\n(VD: Khu nhà có vị trí thuận lợi, gần công viên, trường học...)`}
                            multiline
                            numberOfLines={5}
                            value={description}
                            onChangeText={setDescription}
                        />
                        <Text className="text-gray-400 text-xs mt-2">Tối thiểu 30 ký tự, tối đa 3000 ký tự</Text>
                    </View>

                    {/* Chọn ảnh */}
                    <TouchableOpacity onPress={pickImages} className='bg-gray-200 flex-row justify-center items-center my-2 rounded-xl'>
                        <Text className="p-2 font-medium">Chọn ảnh</Text>
                    </TouchableOpacity>
                    <View className='flex-row flex-wrap justify-center'>
                        {imageUrls.map((url, index) => (
                            <TouchableOpacity key={index} className='w-[40%] bg-gray-100 m-1 rounded-md' onPress={() => console.log('Ảnh bấm:', url)}>
                                <Image
                                    source={{ uri: url }}
                                    className="h-[100px] rounded-md m-2"
                                />
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </ScrollView>

            {/* Nút cập nhật */}
            <TouchableOpacity onPress={handleUpdate} className="bg-red-600 py-3 rounded-full items-center mx-10 my-5">
                <Text className="text-white font-semibold text-base">Cập nhật</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}
