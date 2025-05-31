import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  Pressable,
  TouchableOpacity,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import { SafeAreaView } from 'react-native-safe-area-context';
import images from '@/constants/images';
import axios from 'axios';

const RealEstateDetail = () => {
  const { data } = useLocalSearchParams();
  const { user } = useUser();
  const hostId = process.env.EXPO_PUBLIC_LOCAL_HOST_ID;

  if (!data) return <Text className="text-center mt-10">Đang tải dữ liệu...</Text>;
  const item = JSON.parse(data as string);

  const [selectedImage, setSelectedImage] = useState(
    item.list_images.length > 0 ? item.list_images[0] : null
  );
  const [color, setColor] = useState('red');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setColor((prev) => (prev === 'red' ? 'black' : 'red'));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleLiked = async () => {
    setIsLoading(true);
    try {
      const post = {
        id_user: user?.id,
        id_house: item._id,
        image: item.list_images,
        title: item.title,
        price: item.price,
        address: item.address,
      };

      const res = await axios.post(`${hostId}:80/api/addLiked`, post);

      setTimeout(() => {
        setIsLoading(false);
        Alert.alert(
          'Thông báo!',
          res.data.message,
          [{ text: 'OK', onPress: () => console.log('Thêm thành công') }],
          { cancelable: false }
        );
      }, 1000);
    } catch (err) {
      setIsLoading(false);
      console.error(err);
      Alert.alert('Lỗi', 'Không thể thêm vào mục yêu thích');
    }
  };

  const handleChat = async (id_item: string, id_cus: string) => {
    try {
      const res = await axios.post(`${hostId}:80/api/addUser_chat`, {
        id_user: user?.id,
        id_cus: id_cus,
      });
      console.log(res.data);
      const userRes = await axios.post(`${hostId}:80/api/getUser`, {
        id_user: id_cus,
      });

      const userData = userRes.data[0];

      const chatData = {
        _id: res.data.data._id,
        id_user: user?.id,
        id_cus: id_cus,
        name: userData.name,
        image_url: userData.image_url,
        lastMessage: "Ấn vào để xem tin nhắn!!",
      };

      router.push({
        pathname: "../chatbot/chatDetail",
        params: {
          chat: JSON.stringify(chatData),
        },
      });
    } catch (error) {
      console.error("❌ Lỗi khi bắt đầu chat:", error);
    }
  };


  return (
    <SafeAreaView className="flex-1 bg-white">
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

      <ScrollView>
        {/* Ảnh lớn + nút quay lại + like */}
        <View className="relative p-1">
          <Image
            source={selectedImage ? { uri: selectedImage } : images.homeBig}
            className="w-full h-[210px]"
            resizeMode="cover"
          />

          <TouchableOpacity
            onPress={() => router.back()}
            className="absolute top-[10px] left-4"
          >
            <Ionicons name="arrow-back-outline" size={30} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleLiked}
            className="absolute top-[10px] right-4"
          >
            <Ionicons name="heart-circle-outline" size={30} color={color} />
          </TouchableOpacity>
        </View>

        {/* Ảnh nhỏ */}
        {item.list_images.length > 1 && (
          <ScrollView horizontal className="px-4 py-2" showsHorizontalScrollIndicator={false}>
            {item.list_images.map((img: string, index: number) => (
              <TouchableOpacity key={index} onPress={() => setSelectedImage(img)} className="mr-2">
                <Image
                  source={{ uri: img }}
                  className="w-16 h-16 rounded-md border border-gray-300"
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Giá */}
        <View className="px-4 py-2 border-b border-gray-200">
          <Text className="text-red-600 text-2xl font-bold">
            {item.price.toLocaleString('vi-VN')} {item.price_unit}
          </Text>
          <Text className="text-gray-500 mt-1"> Địa chỉ: {item.address}</Text>

          {/* <Text className="text-gray-500 mt-1">
            ~{Math.round(item.price / item.land_area).toLocaleString('vi-VN')} VND/m²
          </Text> */}
          <Text className="mt-2 text-gray-700">
            {item.bedroom} PN • {item.bathroom} WC • {item.floor} tầng
          </Text>
        </View>

        {/* Tiêu đề + địa chỉ */}
        <View className="px-4 py-3">
          <Text className="text-xl font-semibold text-black">{item.title}</Text>
        </View>

        {/* Mô tả */}
        <View className="px-4 py-2 space-y-2">
          <Text className="font-semibold text-base text-black">Mô tả</Text>
          <Text className="text-gray-700">{item.description}</Text>
        </View>

        {/* Đặc điểm */}
        <View className="px-4 py-4 border-t border-gray-200 space-y-2">
          <Text className="font-semibold text-base text-black">Đặc điểm bất động sản</Text>
          {[
            ['Diện tích', `${item.land_area} m²`],
            ['Mức giá', `${item.price.toLocaleString('vi-VN')} ${item.price_unit}`],
            ['Số phòng ngủ', item.bedroom],
            ['Số phòng tắm', item.bathroom],
            ['Số tầng', item.floor],
          ].map(([label, value], idx) => (
            <View key={idx} className="flex-row justify-between">
              <Text className="text-gray-600">{label}:</Text>
              <Text className="font-medium">{value}</Text>
            </View>
          ))}
        </View>

        {/* Nút gọi */}
        <View className="px-4 py-6 gap-2">
          <TouchableOpacity className="bg-red-600 rounded-full py-3 flex-row items-center justify-center">
            <Ionicons name="call-outline" size={20} color="#fff" />
            <Text className="text-white ml-2 font-semibold text-base">{item.phone_number}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => { handleChat(item._id, item.id_user) }} className="bg-red-600 rounded-full py-3 flex-row items-center justify-center">
            <Ionicons name="chatbubble-outline" size={20} color="#fff" />
            <Text className="text-white ml-2 font-semibold text-base">Nhắn tin</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default RealEstateDetail;
