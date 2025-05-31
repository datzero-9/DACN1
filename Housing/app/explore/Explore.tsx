import React from 'react-native';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
// import House from './assets/house.png'; // Import ảnh ngôi nhà
import images from "@/constants/images"
import { useFocusEffect, useRouter } from 'expo-router';
import { useUser, useClerk } from '@clerk/clerk-expo';
import { useState, useEffect, useCallback } from "react";
import axios from 'axios';
import { Alert } from 'react-native';

const HomeScreen = () => {
    const { user } = useUser();
    const hostId = process.env.EXPO_PUBLIC_LOCAL_HOST_ID;
    // console.log("User Info==================:", user)
    const router = useRouter();

    const handlePost = () => {
        if (myTurn === 0) {
            Alert.alert(
                "Hết lượt đăng",
                "Bạn đã hết lượt đăng bài. Vui lòng mua thêm để tiếp tục sử dụng.",
                [
                    {
                        text: "Cancel",
                        style: "cancel"
                    },
                    {
                        text: "OK",
                        onPress: () => {
                            console.log("Người dùng chọn OK");
                        }
                    }
                ]
            );
        } else {
            router.push('/explore/CURD/Detail');
        }
    };



    useFocusEffect(
        useCallback(() => {
            Post();
            fetchChats()
            infoUser()
        }, [user?.id])
    );


    const [myHouses, setMyHouses] = useState([]);
    const Post = () => {
        try {
            axios.post(`${hostId}:80/api/getUserHouses`, {
                userId: user?.id
            })
                .then((res) => {
                    setMyHouses(res.data)
                    console.log("Số bài viết đã đăng:", res.data.length);
                })
        } catch (error) {
            console.log("Error in Post component:", error);
        }
    }

    const [myChat, setMyChat] = useState([]);
    const fetchChats = () => {
        try {

            axios.get(`${hostId}:80/api/getUser_chat/${user?.id}`)
                .then((res) => {
                    setMyChat(res.data);
                    console.log("Danh sách chat:", res.data.length);
                })

        } catch (error) {
            console.error("Lỗi lấy danh sách chat:", error);
        }
    };

    const [myTurn, setMyTurn] = useState();
    const infoUser = () => {
        try {

            axios.post(`${hostId}:80/api/getUser`, { id_user: user?.id })
                .then((res) => {
                    setMyTurn(res.data[0].turn);
                    console.log("bạn còn lượt đăng bài:", res.data[0].turn);
                    console.log("--------------------------------");
                })

        } catch (error) {
            console.error("Lỗi lấy danh sách chat:", error);
        }
    };
    const infoYour = [
        { id: 1, icon: "flame-outline", title: "Quan trọng", color: "red" },
        { id: 2, icon: "newspaper-outline", title: "Thông tin", color: "green" },
        { id: 3, icon: "search-circle-outline", title: "Gợi ý", color: "orange" },
        { id: 4, icon: "eye-off", title: "Đã bị ẩn", color: "black" },
    ]
    const [press, setPress] = useState(0)
    const handlePress = (id: number) => {
        setPress(id)
    }
    return (
        <ScrollView className=" bg-gray-100">
            {/* Header */}
            <View className="bg-red-600 p-4 pt-5 rounded-b-2xl">
                <View className="flex-row justify-between items-center">
                    <View className="flex-row items-center">
                        <View className="bg-white rounded-full p-2 w-12 h-12 ">
                            <Text className="text-center text-red-600 font-bold text-xl">Đ</Text>
                        </View>
                        <View className="ml-3">
                            <Text className="text-white font-bold text-base">Xin chào bạn</Text>
                            <View className="flex-row items-center">
                                <Text className="text-white font-semibold mr-1">{user?.fullName}</Text>
                                <Feather name="chevron-right" size={20} color="white" />
                            </View>
                        </View>
                    </View>
                    <TouchableOpacity onPress={() => { router.push('/explore/Predict') }}>
                        <Ionicons name="cash-outline" size={24} color="white" />
                    </TouchableOpacity>
                </View>

                {/* Quà tặng */}
                <View className="bg-white rounded-2xl p-4 mt-4 items-center">
                    <Image source={images.home} className="w-[200px] h-[100px] mb-2" />
                    <Text className="text-red-600 font-bold text-lg mb-2">Quà tặng 1 tin thường 15 ngày</Text>
                    <Text className="text-gray-600 text-sm text-center mb-4">Tin đăng của bạn sẽ được tiếp cận hơn 6 triệu người tìm mua / thuê bất động sản mỗi tháng</Text>
                    <TouchableOpacity className="bg-red-600 rounded-full px-6 py-2" onPress={() => { handlePost() }}>
                        <Text className="text-white font-semibold">+ Tạo tin đăng bài ngay</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Tổng quan tài khoản */}
            <View className="bg-white rounded-2xl p-4 m-4">
                <Text className="text-lg font-bold mb-4">Tổng quan tài khoản</Text>

                <ScrollView horizontal showsHorizontalScrollIndicator={true} >
                    <View className="flex-row gap-6 pb-4">


                        <TouchableOpacity className=" w-40 bg-gray-100 p-2 rounded-2xl"
                            onPress={() => {
                                router.push({
                                    pathname: "/explore/CURD/Post"
                                })
                            }}>
                            <View className='flex-row gap-1'>
                                <Ionicons name="newspaper-outline" size={24} color="gray" />
                                <Text className="text-sm mt-1">Tin đăng</Text>
                            </View>
                            <Text className="text-[12px]">Đang hiển thị</Text>
                            <Text className="text-xl font-bold">{myHouses.length} Tin</Text>
                            <TouchableOpacity className='flex-row items-center py-1'>
                                <Text className="text-red-600 text-sm font-medium">Đăng tin </Text>
                                <Ionicons name="chevron-forward-outline" size={14} color="red" />
                            </TouchableOpacity>
                        </TouchableOpacity>

                        <TouchableOpacity className=" w-40 bg-gray-100 p-2 rounded-2xl"
                            onPress={() => {
                                router.push({
                                    pathname: "/(tabs)/chatbot"
                                })
                            }}>

                            <Ionicons name="people-circle-outline" size={24} color="gray" />
                            <Text className="text-sm mt-1">Số người liên hệ</Text>

                            <Text className="text-xl font-bold">{myChat.length} Người</Text>
                            <TouchableOpacity className='flex-row items-center py-1'>
                                <Text className="text-red-600 text-sm font-medium">Xem ngay </Text>
                                <Ionicons name="chevron-forward-outline" size={14} color="red" />
                            </TouchableOpacity>
                        </TouchableOpacity>

                        <TouchableOpacity className=" w-40 bg-gray-100 p-2 rounded-2xl"
                            onPress={() => {
                                router.push({
                                    pathname: "/explore/BuyTurn/SelectOption"
                                })
                            }}>
                            <View className='flex-row gap-1'>
                                <Ionicons name="cash-outline" size={24} color="gray" />
                                <Text className="text-sm mt-1">Tài khoản của bạn</Text>
                            </View>
                            <Text className="text-xl font-bold">Còn {myTurn} lần đăng </Text>
                            <TouchableOpacity className='flex-row items-center py-1'>
                                <Text className="text-red-600 text-sm font-medium">Đăng ký thêm </Text>
                                <Ionicons name="chevron-forward-outline" size={14} color="red" />
                            </TouchableOpacity>

                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </View>

            {/* Thông tin dành riêng cho bạn */}
            <View className="bg-white rounded-2xl plex-row p-4 m-4">

                <Text className="text-lg font-bold mb-4">Thông tin dành riêng cho bạn</Text>
                <ScrollView horizontal className=''>
                    <View className="flex-row gap-3 mb-4">
                        {
                            infoYour.map((items, index) => {
                                return (
                                    <TouchableOpacity
                                        onPress={() => { handlePress(items.id) }}
                                        key={index}
                                        className={`flex-row items-center gap-1 ${press === items.id ? 'bg-red-500 ' : "bg-gray-200"}  rounded-full px-4 py-2`}>
                                        <Ionicons name={items.icon as any} color={press === items.id ? "text-white" : items.color as any} size={15} />
                                        <Text className={`text-sm font-medium ${press === items.id ? "text-white" : "black"} `}>{items.title}</Text>
                                    </TouchableOpacity>
                                )
                            })
                        }

                    </View>

                </ScrollView>
            </View>



        </ScrollView>
    );
};

export default HomeScreen;