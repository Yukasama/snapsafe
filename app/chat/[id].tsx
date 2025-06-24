import { useState } from "react";
import { Box } from "@/components/ui/box";
import { ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import { Text } from "@/components/ui/text";
import { useLocalSearchParams, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

// Mock chat data - should match the data from index.tsx
const mockChats = [
  {
    id: 1,
    name: "John Doe",
    avatar: "👨‍💼",
    isOnline: true,
  },
  {
    id: 2,
    name: "Sarah Wilson",
    avatar: "👩‍🎨",
    isOnline: true,
  },
  {
    id: 3,
    name: "Team Group",
    avatar: "👥",
    isOnline: false,
  },
  {
    id: 4,
    name: "Mom",
    avatar: "👩‍🦳",
    isOnline: false,
  },
  {
    id: 5,
    name: "Alex Johnson",
    avatar: "👨‍💻",
    isOnline: false,
  },
  {
    id: 6,
    name: "Emma Davis",
    avatar: "👩‍🦰",
    isOnline: true,
  },
];

// Mock messages for the chat
const mockMessages = [
  {
    id: 1,
    text: "Hey there! How are you doing?",
    timestamp: "10:30 AM",
    isMe: false,
  },
  {
    id: 2,
    text: "I'm doing great! Just working on some new projects. How about you?",
    timestamp: "10:32 AM",
    isMe: true,
  },
  {
    id: 3,
    text: "That sounds awesome! I'd love to hear more about what you're working on.",
    timestamp: "10:33 AM",
    isMe: false,
  },
  {
    id: 4,
    text: "Sure! I'm building a chat app with React Native and Expo. It's been really fun so far.",
    timestamp: "10:35 AM",
    isMe: true,
  },
  {
    id: 5,
    text: "Nice! That's exactly what I've been wanting to learn. Any tips for getting started?",
    timestamp: "10:37 AM",
    isMe: false,
  },
];

const MessageBubble = ({ message }: { message: (typeof mockMessages)[0] }) => {
  return (
    <Box className={`flex-row mb-3 ${message.isMe ? "justify-end" : "justify-start"}`}>
      <Box
        className={`max-w-[80%] px-4 py-2 rounded-2xl ${
          message.isMe ? "bg-blue-500 rounded-br-md" : "bg-background-800 rounded-bl-md"
        }`}
      >
        <Text className={`text-sm ${message.isMe ? "text-white" : "text-typography-white"}`}>{message.text}</Text>
        <Text className={`text-xs mt-1 ${message.isMe ? "text-blue-100" : "text-typography-400"}`}>
          {message.timestamp}
        </Text>
      </Box>
    </Box>
  );
};

export default function ChatScreen() {
  const { id } = useLocalSearchParams();
  const [message, setMessage] = useState("");

  // Find the chat data based on the ID
  const chat = mockChats.find((c) => c.id === parseInt(id as string));

  if (!chat) {
    return (
      <SafeAreaView className="flex-1 bg-black">
        <Text className="text-typography-white text-center mt-10">Chat not found</Text>
      </SafeAreaView>
    );
  }

  const sendMessage = () => {
    if (message.trim()) {
      // Here you would normally send the message to your backend
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
              <TouchableOpacity>
                <Text className="text-typography-white text-xl">📞</Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <Text className="text-typography-white text-xl">📹</Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <Text className="text-typography-white text-xl">⋮</Text>
              </TouchableOpacity>
            </Box>
          </Box>
        </Box>

        {/* Messages */}
        <ScrollView
          className="flex-1 px-4 py-2"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          {mockMessages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
        </ScrollView>

        {/* Message Input */}
        <Box className="bg-black px-4 py-3 border-t border-outline-700">
          <Box className="flex-row items-center">
            <TouchableOpacity className="mr-3">
              <Text className="text-typography-white text-xl">📎</Text>
            </TouchableOpacity>

            <Box className="flex-1 bg-background-800 rounded-full px-4 py-2 flex-row items-center">
              <TextInput
                className="flex-1 text-typography-white text-base"
                placeholder="Type a message..."
                placeholderTextColor="#666"
                value={message}
                onChangeText={setMessage}
                multiline
                maxLength={1000}
              />
              <TouchableOpacity className="ml-2">
                <Text className="text-typography-white text-xl">😊</Text>
              </TouchableOpacity>
            </Box>

            <TouchableOpacity className="ml-3" onPress={sendMessage}>
              <Box className="w-10 h-10 bg-blue-500 rounded-full items-center justify-center">
                <Text className="text-white text-lg">→</Text>
              </Box>
            </TouchableOpacity>
          </Box>
        </Box>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
