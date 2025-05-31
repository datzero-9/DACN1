import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    Alert,
    Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import { router, useFocusEffect, useRouter } from 'expo-router';
import { useUser, useClerk } from '@clerk/clerk-expo';

const options = [
    { id: 1, label: '1', price: 5000 },
    { id: 5, label: '5', price: 5000 * 5 * 0.8 },
    { id: 10, label: '10', price: 5000 * 10 * 0.8 * 0.8 },
    { id: 15, label: '15', price: 5000 * 15 * 0.8 * 0.8 * 0.8 },
    { id: 20, label: '20', price: 5000 * 20 * 0.8 * 0.8 * 0.8 * 0.8 },
];

export default function PurchaseOptions() {
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [formattedPrice, setFormattedPrice] = useState<string>("");
    const { user } = useUser();
    const hostId = process.env.EXPO_PUBLIC_LOCAL_HOST_ID;
    // Format price chỉ khi selectedId thay đổi
    useEffect(() => {
        if (selectedId !== null) {
            const selectedOption = options.find(o => o.id === selectedId);
            if (selectedOption) {
                const formatted = selectedOption.price.toLocaleString('vi-VN') + ' VND';
                setFormattedPrice(formatted);
            } else {
                setFormattedPrice('');
            }
        } else {
            setFormattedPrice('');
        }
    }, [selectedId]);

    const handleBuy = () => {
        if (selectedId === null) {
            Alert.alert('Thông báo', 'Vui lòng chọn số lượt đăng bài trước khi thanh toán');
            return;
        }
        const selectedOption = options.find(o => o.id === selectedId);
        Alert.alert(
            'Xác nhận mua',
            `Bạn chọn ${selectedOption?.label} lượt với giá ${formattedPrice}. Tiếp tục?`,
            [
                {
                    text: 'Hủy',
                    style: 'cancel',
                },
                {
                    text: 'Tiếp tục',
                    onPress: () => {
                        const info = {
                            id_user: user?.id,
                            name: user?.fullName,
                            image_url: user?.imageUrl,
                            email: user?.emailAddresses[0].emailAddress,
                            total_price: selectedOption?.price,
                            amount: selectedOption?.label,
                        };
                        console.log('Thông tin thanh toán:', info);
                        try {
                            axios.post(`${hostId}:80/api/Payment`, { info })
                                .then((res) => {
                                    Alert.alert(
                                        'Thông báo',
                                        'Chuyển đến trang thanh toán',
                                        [
                                            {
                                                text: 'OK',
                                                onPress: () => {
                                                    const paymentUrl = res.data.order_url;
                                                    if (paymentUrl) {
                                                        Linking.openURL(paymentUrl);
                                                    } else {
                                                        Alert.alert('Lỗi', 'Không nhận được đường dẫn thanh toán');
                                                    }
                                                }
                                            }
                                        ],
                                        { cancelable: false }
                                    );
                                });
                        } catch (err) {
                            console.error('Lỗi khi thanh toán:', err);
                            Alert.alert('Lỗi', 'Thanh toán thất bại, vui lòng thử lại');
                        }
                    },
                },
            ],
        );
    };

    const renderItem = ({ item }: { item: typeof options[0] }) => {
        const isSelected = item.id === selectedId;

        return (
            <TouchableOpacity
                onPress={() => setSelectedId(item.id)}
                activeOpacity={0.7}
                className={`mx-2 w-20 rounded-xl border p-3 items-center
          ${isSelected ? 'bg-red-600 border-red-600' : 'bg-white border-gray-300'}`}
            >
                <View className="flex-row items-center mb-2">
                    <Ionicons
                        name="arrow-up-outline"
                        size={24}
                        color={isSelected ? 'white' : 'black'}
                    />
                    <Text className={`ml-2 text-lg font-semibold ${isSelected ? 'text-white' : 'text-black'}`}>
                        {item.label}
                    </Text>
                </View>
                <Text className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-600'}`}>
                    {item.price.toLocaleString('vi-VN')} VND
                </Text>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* Header */}
            <View className="bg-red-600 p-4 flex-row justify-between items-center border-t border-gray-200">
                <Text className="text-white text-xl font-bold">
                    Tất cả lựa chọn phù hợp với bạn
                </Text>
                <TouchableOpacity
                    onPress={() => router.back()}
                >
                    <Text className="text-white text-sm font-medium border border-white rounded-3xl px-3 py-1">
                        Thoát
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Subtitle */}
            <Text className="text-center text-lg font-semibold mt-5 mb-3">
                Chọn số lượt đăng bài (1 lượt = 5.000 VND)
            </Text>

            {/* Options list */}
            <View className="py-3 bg-gray-100">
                <FlatList
                    horizontal
                    data={options}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 10 }}
                />
            </View>

            {/* Hiển thị giá tiền đã chọn */}
            {selectedId !== null && (
                <Text className="text-center text-lg font-semibold mt-5 mb-3">
                    Tổng tiền: {formattedPrice}
                </Text>
            )}


            <TouchableOpacity
                onPress={handleBuy}
                className="bg-red-600 mx-10 rounded-full py-3 items-center"
            >
                <Text className="text-white text-base font-semibold">
                    Xác nhận mua
                </Text>
            </TouchableOpacity>

            <Text className="text-center text-lg font-semibold mt-5 mb-3">
                Xin chân thành cảm ơn bạn đã ủng hộ chúng tôi!!!
            </Text>
        </SafeAreaView>
    );
}
