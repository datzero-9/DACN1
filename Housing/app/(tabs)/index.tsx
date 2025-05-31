import React, { useEffect, useState, useCallback } from 'react';
import { StatusBar, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SearchBar from '../home/SearchBar';
import RealEstateList from '../home/RealEstateList';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native'; // 👈 thêm dòng này

const hostID = process.env.EXPO_PUBLIC_LOCAL_HOST_ID;

const Home = () => {
  const [data, setData] = useState([]);
  const [searchText, setSearchText] = useState('');

  // Gọi API
  const getHouse = async (keyword: string) => {
    try {
      const res = await axios.get(`${hostID}:80/api/getHouse`, {
        params: {
          title: keyword || undefined,
        },
      });

      setData(res.data);
      // console.log(res.data);
    } catch (err) {
      console.error('Lỗi lấy nhà:', err);
    }
  };

  // ✅ Mỗi khi bấm vào tab Home (index) thì gọi lại
  useFocusEffect(
    useCallback(() => {
      getHouse('');
    }, [])
  );

  // Debounce search
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      getHouse(searchText);
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchText]);

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <StatusBar
        backgroundColor="red"
        barStyle="light-content"
      />
      <View className="p-4">

        <SearchBar
          searchText={searchText}
          onChangeText={setSearchText}
          onSearch={(keyword) => getHouse(keyword)}
        />
      </View>

      <RealEstateList data={data} />
      <View className="pt-[70px]" />
    </SafeAreaView>
  );
};

export default Home;
