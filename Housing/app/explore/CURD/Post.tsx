import {
    View,
    Text,
    ActivityIndicator,
    Modal,
    TouchableOpacity,
    Image,
    FlatList,
    Alert,
} from 'react-native';
import React, { useCallback, useState } from 'react';
import { useUser } from '@clerk/clerk-expo';
import { router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';

interface Item {
    _id: string;
    id_user: string;
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
    title_normalized: string;
    description: string;
    phone_number: string;
    createdAt?: Date;
    updateAt?: Date;
    user?: { name: string };
}

const Post = () => {
    const { user } = useUser();
    const hostId = process.env.EXPO_PUBLIC_LOCAL_HOST_ID;

    const [myHouses, setMyHouses] = useState<Item[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Hàm lấy danh sách bài đăng user
    const fetchUserHouses = async () => {
        try {
            setIsLoading(true);
            const res = await axios.post(`${hostId}:80/api/getUserHouses`, {
                userId: user?.id,
            });
            setMyHouses(res.data);
        } catch (error) {
            console.error('Lỗi lấy danh sách bài đăng:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Gọi API khi màn hình focus và user thay đổi
    useFocusEffect(
        useCallback(() => {
            fetchUserHouses();
        }, [user?.id])
    );
    const handleView = (id: string) => {
        console.log(id)
        try {
            axios.get(`${hostId}:80/api/house/${id}`)
                .then((res) => {
                    router.push({
                        pathname: "/home/[id]",
                        params: {
                            id: id,
                            data: JSON.stringify(res.data),
                        },
                    });
                })
        } catch (error) {
            console.log(error)
        }
    };



    const handleEdit = async (id: string) => {
        try {

            const res = await axios.get(`${hostId}:80/api/house/${id}`);
            const houseData = res.data;

            console.log("House data for edit:", houseData);
            router.push({
                pathname: "/explore/CURD/Update",
                params: {
                    data: JSON.stringify(houseData),
                },
            });
        } catch (error) {
            console.error("Lỗi lấy thông tin house:", error);
            Alert.alert("Lỗi", "Không lấy được thông tin nhà để sửa.");
        }
    };




    const handleDelete = (id: string) => {
        Alert.alert(
            'Xác nhận',
            'Bạn có chắc muốn xóa bài đăng này không?',
            [
                {
                    text: 'Hủy',
                    style: 'cancel',
                },
                {
                    text: 'Xóa',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setIsLoading(true);
                            await axios.delete(`${hostId}:80/api/deleteHouse/${id}`);
                            await fetchUserHouses();
                            Alert.alert('Xóa thành công');
                        } catch (error) {
                            Alert.alert('Lỗi', 'Xóa bài đăng không thành công.');
                            console.error(error);
                        } finally {
                            setIsLoading(false);
                        }
                    },
                },
            ],
            { cancelable: false }
        );
    };

    const renderItem = ({ item }: { item: Item }) => (
        <TouchableOpacity
            onPress={() => handleView(item?._id)}
            className="bg-white rounded-xl shadow p-4 m-2 flex-1"
            style={{ maxWidth: '48%' }}
        >
            <Image
                source={
                    item.list_images && item.list_images.length > 0
                        ? { uri: item.list_images[0] }
                        : { uri: '' }
                }
                className="w-full h-40 rounded-lg mb-3"
                resizeMode="cover"
            />

            <Text numberOfLines={1} className="text-base font-semibold mb-1">
                {item.title}
            </Text>
            <Text numberOfLines={2} className="text-[10px] mb-1">
                {item.address}
            </Text>
            <Text className="text-red-600 font-bold mb-1">
                {item.price.toLocaleString('vi-VN')} {item.price_unit}
            </Text>

            <View className="flex-col justify-between gap-1">
                <TouchableOpacity
                    onPress={() => handleEdit(item?._id)}
                    className="flex-1 bg-yellow-600 rounded-md py-2 items-center"
                >
                    <Text className="text-white font-semibold">Sửa</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => handleDelete(item._id)}
                    className="flex-1 bg-red-600 rounded-md py-2 items-center"
                >
                    <Text className="text-white font-semibold">Xóa</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView className="flex-1 bg-white m-0 p-0">
            {/* Header */}
            <View className="bg-red-600 p-2 flex-row items-center justify-between px-4 border-t border-gray-200">
                <Text className="text-xl text-white font-bold">Tất cả bài đăng của bạn</Text>
                <TouchableOpacity onPress={() => router.push({
                    pathname: "/(tabs)/explore",
                })}>
                    <Text className="text-white text-sm font-medium border border-white rounded-3xl px-3 py-1">
                        Thoát
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Loading modal */}
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

            {/* Nếu không có bài đăng */}
            {myHouses.length === 0 && !isLoading ? (
                <View className="flex-1 justify-center items-center p-4">
                    <Text>Chưa có bài viết nào.</Text>
                </View>
            ) : (
                <FlatList
                    data={myHouses}
                    keyExtractor={(item) => item._id}
                    renderItem={renderItem}
                    contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 12 }}
                    showsVerticalScrollIndicator={false}
                    numColumns={2}
                />
            )}
        </SafeAreaView>
    );
};

export default Post;
