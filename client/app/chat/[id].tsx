import { useRef, useState } from "react";
import { Box } from "@/components/ui/box";
import { ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import { Text } from "@/components/ui/text";
import { useLocalSearchParams, router, Link, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { mockChats } from "@/config/mock-chats";
import { Message, useChats } from "@/context/ChatContext";

const MessageBubble = ({ message }: { message: Message }) => {
  if (message.type !== "text") {
    return (
      <Box className={`flex-row mb-3 ${message.isMe ? "justify-end" : "justify-start"}`}>
        <Box
          className={`max-w-[80%] px-4 py-2 rounded-2xl ${
            message.isMe ? "bg-blue-500 rounded-br-md" : "bg-background-800 rounded-bl-md"
          }`}
        >
          <Text className={`text-sm italic ${message.isMe ? "text-white" : "text-typography-white"}`}>
            Photo received
          </Text>
          <Text className={`text-xs mt-1 ${message.isMe ? "text-blue-100" : "text-typography-400"}`}>
            {message.timestamp?.toLocaleTimeString("de-DE")}
          </Text>
        </Box>
      </Box>
    );
  }
  return (
    <Box className={`flex-row mb-3 ${message.isMe ? "justify-end" : "justify-start"}`}>
      <Box
        className={`max-w-[80%] px-4 py-2 rounded-2xl ${
          message.isMe ? "bg-blue-500 rounded-br-md" : "bg-background-800 rounded-bl-md"
        }`}
      >
        <Text className={`text-sm ${message.isMe ? "text-white" : "text-typography-white"}`}>{message.content}</Text>
        <Text className={`text-xs mt-1 ${message.isMe ? "text-blue-100" : "text-typography-400"}`}>
          {message.timestamp?.toLocaleTimeString("de-DE")}
        </Text>
      </Box>
    </Box>
  );
};

export default function ChatScreen() {
  const { id } = useLocalSearchParams();
  const [message, setMessage] = useState("");
  const { setCurrentChat, getCurrentChat } = useChats();
  const chat = mockChats.find((c) => c.id === parseInt(id as string));

  useFocusEffect(() => {
    if (id) setCurrentChat(parseInt(id as string));
    console.log("Messages:", getCurrentChat()?.messages);
  });

  if (!chat) {
    return (
      <SafeAreaView className="flex-1 bg-black">
        <Text className="text-typography-white text-center mt-10">Chat not found</Text>
      </SafeAreaView>
    );
  }

  const sendMessage = () => {
    if (message.trim()) {
      console.log("Sending message:", message);
      setMessage("");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : "height"}>
        {/* Header */}
        <Box className="bg-black px-4 py-3 border-b border-outline-700">
          <Box className="flex-row items-center">
            <TouchableOpacity onPress={() => router.back()} className="mr-3">
              <Text className="text-typography-white text-xl">←</Text>
            </TouchableOpacity>

            <Box className="relative mr-3">
              <Box className="w-10 h-10 rounded-full bg-background-200 items-center justify-center">
                <Text className="text-lg">{chat.avatar}</Text>
              </Box>
              {chat.isOnline && (
                <Box className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-black" />
              )}
            </Box>

            <Box className="flex-1">
              <Text className="text-typography-white font-medium text-lg">{chat.name}</Text>
              <Text className="text-typography-400 text-sm">{chat.isOnline ? "Online" : "Last seen recently"}</Text>
            </Box>

            <Box className="flex-row gap-4">
              <TouchableOpacity className="mr-0.5">
                <Ionicons name="call-outline" size={24} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity>
                <Ionicons name="videocam-outline" size={24} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity>
                <MaterialCommunityIcons name="dots-vertical" className="-space-y-0.5" size={24} color="#fff" />
              </TouchableOpacity>
            </Box>
          </Box>
        </Box>

        <ScrollView
          className="flex-1 px-4 py-2"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          {getCurrentChat()?.messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
        </ScrollView>

        <Box className="bg-black px-4 py-3 border-t border-outline-700">
          <Box className="flex-row items-end gap-2">
            <TouchableOpacity className="mr-1.5 mb-1.5">
              <Ionicons name="attach" size={26} color="#aaa" />
            </TouchableOpacity>

            <Box className="flex-1 flex-row items-center bg-background-800 rounded-full px-3" style={{ minHeight: 40 }}>
              <TextInput
                className="flex-1 text-typography-white text-base outline-none h-[29px]"
                placeholder="Type a message..."
                placeholderTextColor="#666"
                value={message}
                onChangeText={setMessage}
                multiline
                maxLength={1000}
                style={{
                  paddingVertical: 1,
                  textAlignVertical: "center",
                }}
              />
              <TouchableOpacity className="ml-3">
                <Ionicons name="happy-outline" size={26} color="#aaa" />
              </TouchableOpacity>
              <Link href="/camera" asChild>
                <TouchableOpacity className="ml-3" onPress={() => console.log("Open camera")}>
                  <Ionicons name="camera-outline" size={26} color="#aaa" />
                </TouchableOpacity>
              </Link>
            </Box>

            {/* Send button */}
            <TouchableOpacity className="ml-1.5" onPress={sendMessage}>
              <Box className="w-10 h-10 bg-blue-500 rounded-full items-center justify-center">
                <Ionicons name="send" size={22} color="#fff" />
              </Box>
            </TouchableOpacity>
          </Box>
        </Box>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
