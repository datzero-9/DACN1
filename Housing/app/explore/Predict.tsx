import React, { useEffect, useState, Dispatch, SetStateAction } from 'react';
import { Picker } from "@react-native-picker/picker";
import DropDownPicker from "react-native-dropdown-picker";
import {
    View, Text, TextInput, Pressable,
    TouchableOpacity, FlatList, Modal,
    ActivityIndicator, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
// import { Alert } from 'react-native';

import axios from 'axios';
import { useUser } from '@clerk/clerk-expo';

type Address = { id: string; name: string; };

export default function Detail() {
    const { user } = useUser();
    const router = useRouter();
    const hostId = process.env.EXPO_PUBLIC_LOCAL_HOST_ID;

    const [bedroom, setBedroom] = useState(0);
    const [bathroom, setBathroom] = useState(0);
    const [floor, setFloor] = useState(0);
    const [landArea, setLandArea] = useState('');
    const [open, setOpen] = useState(false);
    const [cateLand, setCateLand] = useState('');
    const [items, setItems] = useState([
        { label: "Nhà hẻm, ngõ", value: "Nhà hẻm, ngõ" },
        { label: "Nhà mặt tiền", value: "Nhà mặt tiền" },
    ]);

    const [provinces, setProvinces] = useState<Address[]>([]);
    const [districts, setDistricts] = useState<Address[]>([]);
    const [tinhTP, setTinhTP] = useState("");
    const [quanHuyen, setQuanHuyen] = useState("");
    const [predict, setPredict] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => { getProvinces(); }, []);

    const getProvinces = async () => {
        try {
            const res = await axios.get(`https://open.oapi.vn/location/provinces?page=0&size=70`);
            const hcm = res.data.data.find(
                (p: { name: string }) =>
                    p.name.includes("Hồ Chí Minh") || p.name.includes("TP Hồ Chí Minh")
            );

            if (hcm) {
                setProvinces([hcm]);
                setTinhTP(hcm.id);
                getDistricts(hcm.id);
            } else {
                setProvinces([]);
            }
        } catch (err) {
            console.log("Lỗi khi lấy tỉnh/thành phố:", err);
        }
    };


    const getDistricts = async (provinceId: string) => {
        try {
            const res = await axios.get(`https://open.oapi.vn/location/districts/${provinceId}?page=0&size=70`);
            setDistricts(res.data.data);
        } catch (err) {
            console.log("Lỗi khi lấy quận/huyện:", err);
        }
    };


    const handleContinue = () => {
        const info = {
            Area_clean: landArea,
            Bedrooms_clean: bedroom,
            Toilets_clean: bathroom,
            Floors_clean: floor,
            Type_of_House: cateLand,
            District: quanHuyen,
        };

        if (
            !info.Area_clean ||
            isNaN(Number(info.Area_clean)) ||
            Number(info.Area_clean) <= 0 ||
            !info.Type_of_House ||
            info.Type_of_House.trim() === "" ||
            !info.District ||
            info.District.trim() === ""
        ) {
            Alert.alert(
                "Thiếu thông tin",
                "Vui lòng nhập đầy đủ và đúng định dạng: Diện tích, Loại nhà, Quận/Huyện",
                [{ text: "OK" }]
            );
            return;
        }

        setIsLoading(true);
        axios
            .post(`${hostId}:5000/predict`, info)
            .then((res) => {
                console.log("Kết quả dự đoán:", res.data);
                setPredict(res.data.predicted_price_per_m2);
            })
            .catch((err) => {
                console.log("Lỗi dự đoán:", err);
                Alert.alert(
                    "Lỗi",
                    "Không thể kết nối tới server dự đoán",
                    [{ text: "OK" }]
                );
            })
            .finally(() => {
                setIsLoading(false);
            });
    };





    // ** Định nghĩa kiểu rõ ràng cho mảng số lượng **
    const quantityList: [string, number, Dispatch<SetStateAction<number>>][] = [
        ['Số phòng ngủ', bedroom, setBedroom],
        ['Số phòng tắm, vệ sinh', bathroom, setBathroom],
        ['Số tầng', floor, setFloor]
    ];

    return (
        <SafeAreaView className="flex-1 bg-white">

            {/* Header */}
            <View className="p-2 flex-row items-center justify-between px-4 border-t border-gray-200 bg-red-600">
                <Text className="text-xl text-white font-bold">Dự đoán giá nhà</Text>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text className="text-white text-sm font-medium border-white border rounded-3xl px-3 py-1">Thoát</Text>
                </TouchableOpacity>
            </View>

            {isLoading && (
                <Modal visible transparent animationType="fade">
                    <View className="flex-1 justify-center items-center bg-black/60">
                        <View className="bg-zinc-800 px-6 py-4 rounded-xl items-center">
                            <ActivityIndicator size="large" color="red" />
                            <Text className="text-white mt-2 text-base">Đang tải...</Text>
                        </View>
                    </View>
                </Modal>
            )}

            <FlatList
                data={[]}
                renderItem={() => null}
                keyExtractor={() => "key"}
                ListHeaderComponent={
                    <View className="bg-gray-100 p-4">

                        {/* Địa chỉ */}
                        <View className="bg-white p-4 rounded-2xl mb-4">
                            <Text className="font-medium mb-1">Địa chỉ BĐS</Text>

                            <Text className="text-sm font-semibold mb-1">Tỉnh/Thành phố:</Text>
                            <View className="border border-gray-400 rounded mb-2">
                                <Picker
                                    selectedValue={tinhTP}
                                    onValueChange={(value) => {
                                        const selected = provinces.find(p => p.id === value);
                                        setTinhTP(selected?.name || "");
                                        getDistricts(value);
                                        setQuanHuyen("");
                                    }}
                                >
                                    <Picker.Item label="Chọn Tỉnh/Thành phố" value="" />
                                    {provinces.map(item => (
                                        <Picker.Item key={item.id} label={item.name} value={item.id} />
                                    ))}
                                </Picker>
                            </View>

                            <Text className="text-sm font-semibold mb-1">Quận/Huyện:</Text>
                            <View className="border border-gray-400 rounded mb-2">
                                <Picker
                                    selectedValue={quanHuyen}
                                    onValueChange={(value) => {
                                        const selected = districts.find(d => d.id === value);
                                        setQuanHuyen(selected?.name || "");
                                    }}
                                >
                                    <Picker.Item label="Chọn Quận/Huyện" value="" />
                                    {districts.map(item => (
                                        <Picker.Item key={item.id} label={item.name} value={item.id} />
                                    ))}
                                </Picker>
                            </View>
                        </View>

                        {/* Thông tin chính */}
                        <View className="bg-white p-4 rounded-2xl mb-4">
                            <Text className="font-medium mb-2">Thông tin chính</Text>

                            <Text className="text-sm font-medium mb-1">Loại BĐS (nhà)</Text>
                            <DropDownPicker
                                open={open}
                                value={cateLand}
                                items={items}
                                setOpen={setOpen}
                                setValue={setCateLand}
                                setItems={setItems}
                                placeholder="Chọn loại BĐS"
                                style={{ borderRadius: 20, borderColor: "#ccc", backgroundColor: "#f0f0f0", height: 35 }}
                                dropDownContainerStyle={{ borderColor: "#ccc", borderRadius: 12 }}
                                textStyle={{ fontSize: 14 }}
                            />

                            <Text className="text-sm font-medium mt-4">Diện tích (m²)</Text>
                            <TextInput
                                className="border border-gray-300 bg-gray-200 rounded-3xl px-4 py-2 mt-1"
                                placeholder="Nhập diện tích"
                                value={landArea}
                                onChangeText={setLandArea}
                            />
                        </View>

                        {/* Số lượng */}
                        <View className="bg-white p-4 rounded-2xl mb-4">
                            {quantityList.map(([label, value, setter], idx) => (
                                <View key={idx} className="flex-row justify-between items-center mt-4">
                                    <Text className="text-sm font-medium">{label}</Text>
                                    <View className="flex-row items-center space-x-3">
                                        <Pressable onPress={() => setter(Math.max(0, value - 1))} className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center">
                                            <Text className="text-xl font-semibold">-</Text>
                                        </Pressable>
                                        <Text className="text-base mx-2">{value}</Text>
                                        <Pressable onPress={() => setter(value + 1)} className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center">
                                            <Text className="text-xl font-semibold">+</Text>
                                        </Pressable>
                                    </View>
                                </View>
                            ))}
                        </View>

                        {/* Kết quả */}
                        {predict !== "" && (
                            <View className="bg-white p-4 rounded-2xl mb-4">
                                <Text className="font-medium mb-2">Kết quả dự đoán</Text>

                                {/* In thêm các thông tin trong info */}
                                <Text>Diện tích: {landArea}m²</Text>
                                <Text>Số phòng ngủ: {bedroom}</Text>
                                <Text>Số toilet: {bathroom}</Text>
                                <Text>Số tầng: {floor}</Text>
                                <Text>Loại nhà: {cateLand}</Text>
                                <Text>Quận/Huyện: {quanHuyen}</Text>
                                <Text className="font-medium mt-2">Với thông tin như trên:</Text>
                                <Text className="text-red-500 font-semibold text-base">
                                    Giá dự đoán Khoảng: {Math.floor(Number(predict)).toLocaleString()} VND/m²
                                </Text>


                            </View>
                        )}

                    </View>
                }
            />

            {/* Nút Dự đoán */}
            <TouchableOpacity onPress={handleContinue} className="bg-red-600 py-3 rounded-full items-center mx-10 my-5">
                <Text className="text-white font-semibold text-base">DỰ ĐOÁN GIÁ</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}
