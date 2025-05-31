import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import axios from "axios";
import { useUser } from "@clerk/clerk-expo";

interface ChatItem {
  _id: number;
  id_user: string;
  id_cus: string;
  name?: string;
  image_url?: string;
  lastMessage?: string;
}

export default function ChatList() {
  const hostId = process.env.EXPO_PUBLIC_LOCAL_HOST_ID;
  const { user } = useUser();
  const router = useRouter();
  const [searchText, setSearchText] = useState("");
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const aiChatbot = {
    id: 2323,
    name: "AI chatbot tư vấn",
    image_url:
      "https://ocd.vn/wp-content/uploads/2024/11/Ung-dung-AI-cham-soc-khach-hang.jpg",
    lastMessage: "Xin chào bạn! Tôi là AI chatbot tư vấn. Bạn cần gì?",
  };

  useFocusEffect(
    useCallback(() => {
      const fetchChats = async () => {
        try {
          setLoading(true);

          const res = await axios.get(`${hostId}:80/api/getUser_chat/${user?.id}`);
          console.log("Danh sách chat:", res.data);
          const rawChats = res.data;

          const enrichedChats = await Promise.all(
            rawChats.map(async (item: ChatItem) => {
              const myId = user?.id;

              const partnerId = item.id_user === myId ? item.id_cus : item.id_user;
              console.log("Partner ID:", partnerId);
              try {
                const userRes = await axios.post(`${hostId}:80/api/getUser`, {
                  id_user: partnerId,
                });
                const userData = userRes.data[0];

                return {
                  ...item,
                  partnerId,
                  name: userData.name,
                  image_url: userData.image_url,
                  lastMessage: userData.lastMessage || "Ấn vào để xem tin nhắn!!",
                };
              } catch (err) {
                console.warn(`❌ Không lấy được thông tin cho ${partnerId}`, err);
                return {
                  ...item,
                  partnerId,
                  name: "Người dùng ẩn danh",
                  image_url: "https://via.placeholder.com/54",
                  lastMessage: "Không thể tải thông tin",
                };
              }
            })
          );

          setChats(enrichedChats);
        } catch (error) {
          console.error("Lỗi khi lấy danh sách chat:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchChats();
    }, [user?.id])
  );

  return (
    <View className="flex-1 bg-white p-4">
      {/* Search input */}
      <View className="flex-row items-center mb-3">
        <TextInput
          placeholder="Tìm kiếm tin nhắn..."
          value={searchText}
          onChangeText={setSearchText}
          className="flex-1 bg-gray-100 rounded-xl px-4 py-2"
        />
        <TouchableOpacity className="bg-purple-500 p-2 rounded-xl ml-2">
          <Ionicons name="add" size={15} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* AI Chatbot */}
      <TouchableOpacity
        className="flex-row items-center mb-3"
        onPress={() =>
          router.push({
            pathname: "../chatbot/chatDetail",
            params: { chat: JSON.stringify(aiChatbot) },
          })
        }
      >
        <Image
          source={{ uri: aiChatbot.image_url }}
          className="w-[54px] h-[54px] rounded-full mr-3"
        />
        <View className="flex-1 border-b border-gray-200 pb-3">
          <Text className="text-base font-semibold">{aiChatbot.name}</Text>
          <Text className="text-sm text-gray-500" numberOfLines={1}>
            {aiChatbot.lastMessage}
          </Text>
        </View>
      </TouchableOpacity>

      {/* List user chats */}
      {loading ? (
        <ActivityIndicator size="large" color="purple" />
      ) : (
        <FlatList
          data={chats}
          keyExtractor={(item) => item?._id?.toString() || Math.random().toString()}
          renderItem={({ item }) =>
            item?._id !== undefined ? (
              <TouchableOpacity
                className="flex-row items-center mb-3"
                onPress={() => {
                  console.log(item)
                  router.push({
                    pathname: "../chatbot/chatDetail",
                    params: { chat: JSON.stringify(item) },
                  })
                }
                }
              >
                <Image
                  source={{ uri: item.image_url || "https://via.placeholder.com/54" }}
                  className="w-[54px] h-[54px] rounded-full mr-3"
                />
                <View className="flex-1 border-b border-gray-200 pb-3">
                  <Text className="text-base font-semibold">
                    {item.name || "Không tên"}
                  </Text>
                  <Text className="text-sm text-gray-500" numberOfLines={1}>
                    {item.lastMessage || "Ấn vào để xem tin nhắn"}
                  </Text>
                </View>
              </TouchableOpacity>
            ) : null
          }
        />
      )}
    </View>
  );
}
