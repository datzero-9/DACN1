import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";
import { useUser } from "@clerk/clerk-expo";

interface Message {
  id: string;
  text: string;
  from: string;
  time: string;
}

export default function ChatDetail() {
  const hostId = process.env.EXPO_PUBLIC_LOCAL_HOST_ID;
  const { user } = useUser();
  const { chat } = useLocalSearchParams<{ chat: string }>();
  const userObj = chat ? JSON.parse(chat) : null;


  const scrollRef = useRef<ScrollView>(null);

  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [botThinking, setBotThinking] = useState(false);

  const isBot = userObj?.id === 2323;

  // 👇 Fetch messages nếu không phải bot
  useEffect(() => {
    const fetchMessages = async () => {
      if (!isBot && userObj?._id) {
        try {
          await axios.post(`${hostId}:80/api/getMessagesChat`, { id_user_chat: userObj._id })
            .then((res) => {
              console.log("Tin nhắn:", res.data.messages);
              const mappedMessages: Message[] = res.data.messages.map((msg: any) => ({
                id: msg._id,
                text: msg.text || "",
                from: msg.from,
                time: new Date(msg.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
              }));

              setMessages(mappedMessages);
            })


        } catch (error) {
          console.error("❌ Lỗi khi lấy tin nhắn:", error);
        }
      } else if (isBot) {
        setMessages([
          {
            id: "1",
            text: "🤖 Xin chào! Tôi là chatbot. Bạn cần tư vấn gì?",
            from: "bot",
            time: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ]);
      }
    };

    fetchMessages();
  }, [userObj?._id]);




  const handleSend = async () => {
    if (inputText.trim() === "") return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      from: user!.id,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputText("");
    // bên dưới đây là bot
    if (isBot) {
      const info = {
        id_user: 123,
        req: inputText.trim(),
      };
      setBotThinking(true);

      try {
        const res = await axios.post(
          "https://n8n.laptrinhmang3.xyz/webhook/dacn",
          info
        );

        const botReply: Message = {
          id: Date.now().toString() + "-bot",
          text: res.data || "🤖 Xin lỗi, tôi không hiểu bạn nói gì.",
          from: "bot",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };

        setMessages((prev) => [...prev, botReply]);
      } catch (error) {
        console.error("Lỗi khi gọi n8n:", error);
        const fallbackReply: Message = {
          id: Date.now().toString() + "-fail",
          text: "Không thể liên hệ với chatbot. Vui lòng thử lại sau.",
          from: "bot",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };

        setMessages((prev) => [...prev, fallbackReply]);
      } finally {
        setBotThinking(false);
      }
    } else {
      sendMessageToUser(userObj?._id, newMessage.text);
    }
  };



  const sendMessageToUser = async (receiverId: string, messageText: string) => {
    try {
      await axios.post(`${hostId}:80/api/addMessageChat`, {
        id_user_chat: receiverId,
        from: user?.id,
        text: messageText,
        images: "",
      })
        .then((res) => {
          console.log(res.data)
        })
    } catch (error) {
      console.error("❌ Lỗi khi gửi tin nhắn:", error);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={90}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="flex-1">
            {/* Header */}
            <View className="flex-row items-center px-4 py-3 border-b border-gray-200">
              <Image
                source={{ uri: userObj?.image_url }}
                className="w-10 h-10 rounded-full mr-3"
              />
              <View className="flex-1">
                <Text className="text-base font-semibold">{userObj?.name}</Text>
                <Text className="text-xs text-green-500">Online</Text>
              </View>
              <Ionicons name="call-outline" size={24} color="gray" className="mr-4" />
              <Ionicons name="videocam-outline" size={24} color="gray" />
            </View>

            {/* Tin nhắn */}
            <ScrollView
              ref={scrollRef}
              className="px-4 py-2"
              contentContainerStyle={{ paddingBottom: 10 }}
              keyboardShouldPersistTaps="handled"
              onContentSizeChange={() =>
                scrollRef.current?.scrollToEnd({ animated: true })
              }
            >
              {messages.map((msg, index) => (
                <View
                  key={index}
                  style={{ alignItems: msg.from === user?.id ? "flex-end" : "flex-start" }}
                  className="mb-4"
                >
                  <View
                    className={`max-w-[80%] rounded-2xl px-4 py-2 ${msg.from === user?.id ? "bg-indigo-500" : "bg-gray-100"}`}
                  >
                    <Text className={msg.from === user?.id ? "text-white" : "text-black"}>
                      {msg.text}
                    </Text>
                  </View>
                  <Text className="text-xs text-gray-400 mt-1">{msg.time}</Text>
                </View>
              ))}

              {botThinking && (
                <View className="mb-4 items-start">
                  <View className="bg-gray-100 px-4 py-2 rounded-2xl">
                    <ActivityIndicator size="small" color="#6366F1" />
                  </View>
                </View>
              )}
            </ScrollView>

            {/* Input */}
            <View className="flex-row items-center px-4 py-2 border-t border-gray-200">
              <TextInput
                placeholder="Type here..."
                className="flex-1 border border-gray-300 rounded-full px-4 py-2 mr-2 text-sm"
                value={inputText}
                onChangeText={setInputText}
              />
              <TouchableOpacity onPress={handleSend}>
                <Ionicons name="send" size={24} color="#6366F1" />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
