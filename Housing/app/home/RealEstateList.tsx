import React from 'react';
import { FlatList, Image, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import images from '@/constants/images';
import axios from 'axios';

type RealEstateItem = {
  _id: string;
  id_user: string;
  demand: string;
  category: string;
  land_area: string;
  price: number;
  price_unit: String;
  bedroom: number;
  bathroom: number;
  floor: number;
  list_images: any[];
  address: string;
  title: string;
  description: string;
  phone_number: number;
  user: any;
  createdAt: object;
  updateAt: object;
  __v: number;
};

type Props = {
  data: RealEstateItem[];

};

const RealEstateList = ({ data }: Props) => {
  const hostId = process.env.EXPO_PUBLIC_LOCAL_HOST_ID;

  const router = useRouter(); // ✅ hook đúng chỗ

  const handlePress = (item: RealEstateItem) => {
    console.log(item._id)
    try {
      axios.get(`${hostId}:80/api/house/${item._id}`)
        .then((res) => {
          // console.log(res.data)

          router.push({
            pathname: "/home/[id]",
            params: {
              id: item._id,
              data: JSON.stringify(res.data), // truyền full object nếu cần
            },
          });
        })
    } catch (error) {
      console.log(error)
    }
  };

  return (
    <FlatList
      data={data}
      keyExtractor={(item, index) => `${item.id_user}-${index}`}
      renderItem={({ item }) => (
        <TouchableOpacity onPress={() => handlePress(item)}>
          <View className="bg-white rounded-xl shadow p-3 mb-4">
            <Image
              source={item.list_images[0] ? { uri: item.list_images[0] } : images.homeBig}
              className="w-full h-60 rounded-lg mb-2"
              resizeMode="cover"
            />
            <Text className="text-base font-semibold" numberOfLines={2}>
              {item.title}
            </Text>
            <Text className="text-red-600 font-bold mt-1">
              {item.price.toLocaleString('vi-VN')} {item.price_unit}
            </Text>

            <Text className="text-gray-500">{item.address}</Text>

            <View className="flex-row justify-between items-center mt-2">
              <View className="flex-row items-center">
                <Image source={images.home} className="w-6 h-6 mr-2" />
                <Text className="text-sm text-gray-600">{item.user.name}</Text>
              </View>
              <View className="flex-row items-center">
                <TouchableOpacity className="bg-red-500 px-3 py-1 rounded-xl mr-2">
                  <Text className="text-white font-semibold">{item.phone_number}</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => console.log("xin ca")}>
                  {/* Nếu bạn muốn hiện trái tim thì thêm icon AntDesign ở đây */}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      )}
      showsVerticalScrollIndicator={false}
      className="px-4"
      ListEmptyComponent={
        <Text className="text-center text-gray-500 mt-10">
          Không có kết quả phù hợp
        </Text>
      }
    />
  );
};

export default RealEstateList;
