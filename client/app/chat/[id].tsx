import { useCallback, useEffect, useRef, useState } from "react";
import { Box } from "@/components/ui/box";
import { ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import { Text } from "@/components/ui/text";
import { useLocalSearchParams, router, Link, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Message, useChats } from "@/context/ChatContext";
import { getPublicKey, sendEncryptedMessage } from "@/api/backend";
import { encryptContent } from "@/crypto/encryptContent";
import { useUser } from "@/context/UserContext";
import { StatusBar } from "expo-status-bar";

const MessageBubble = ({ message, chatId }: { message: Message, chatId: number }) => {
  const timestamp = message.timestamp || new Date();
  const currentDate = new Date();
  const delta = currentDate.getTime() - timestamp.getTime();
  const isWithin1Minute = delta < 60 * 1000;
  const isWithinLast1Hour = delta < 60 * 60 * 1000;
  const isToday = delta < 24 * 60 * 60 * 1000;
  let formattedDate = "";

  if (isWithin1Minute) {
    formattedDate = "Just now";
  } else if (isWithinLast1Hour) {
    formattedDate = `${Math.floor(delta / (60 * 1000))}m ago`;
  } else if (isToday) {
    formattedDate = timestamp.toLocaleTimeString("de-DE", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } else {
    formattedDate = timestamp.toLocaleDateString("de-DE", {
      minute: "2-digit",
      hour: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  const handlePress = () => {
    console.log("Opening photo viewer for chatId:", chatId);
    router.push({
      pathname: "/view-photo",
      params: {
        chatId: chatId,
      },
    });
  };

  if (message.type === "image") {
    console.log("Rendering image message bubble", message);
    if (message.unread) {
      return (
        <TouchableOpacity onPress={handlePress}>
          <Box className={`flex-row mb-3 ${message.isMe ? "justify-end" : "justify-start"}`}>
            <Box
              className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                message.isMe ? "bg-blue-500 rounded-br-md" : "bg-zinc-800 rounded-bl-md"
              }`}
            >
              <Box className="flex-row items-center gap-2">
                <Ionicons name="eye" size={16} color={message.isMe ? "white" : "#aaa"} />
                <Text className={`text-sm italic ${message.isMe ? "text-white" : "text-typography-white"}`}>
                  Photo received
                </Text>
              </Box>
              <Text className={`text-xs mt-1 ${message.isMe ? "text-blue-100" : "text-typography-400"}`}>
                {formattedDate}
              </Text>
            </Box>
          </Box>
        </TouchableOpacity>
      );
    } else {
      return (
        <Box className={`flex-row mb-3 ${message.isMe ? "justify-end" : "justify-start"}`}>
          <Box
            className={`max-w-[80%] px-4 py-2 rounded-2xl ${
              message.isMe ? "bg-blue-500 rounded-br-md" : "bg-zinc-800 rounded-bl-md"
             }`}
          >
            <Box className="flex-row items-center gap-2">
              <Ionicons name="reader" size={16} color={message.isMe ? "white" : "#aaa"} />
              <Text className={`text-sm italic ${message.isMe ? "text-white" : "text-typography-white"}`}>
                Photo received
              </Text>
            </Box>
            <Text className={`text-xs mt-1 ${message.isMe ? "text-blue-100" : "text-typography-400"}`}>
              {formattedDate}
            </Text>
          </Box>
        </Box>
      );
    }
  }
  return (
    <Box className={`flex-row mb-3 ${message.isMe ? "justify-end" : "justify-start"}`}>
      <Box
        className={`max-w-[80%] px-4 py-2 rounded-2xl ${
          message.isMe ? "bg-blue-500 rounded-br-md" : "bg-zinc-800 rounded-bl-md"
        }`}
      >
        <Text className={`text-sm ${message.isMe ? "text-white" : "text-typography-white"}`}>{message.content as string}</Text>
        <Text className={`text-xs mt-1 ${message.isMe ? "text-blue-100" : "text-typography-400"}`}>
            {formattedDate}
        </Text>
      </Box>
    </Box>
  );
};

export default function ChatScreen() {
  const { username } = useUser();
  const { id } = useLocalSearchParams();
  const [message, setMessage] = useState("");
  const { setCurrentChat, getCurrentChat, setChats, chats, updateChat } = useChats();
  const chat = chats.find((c) => c.id === parseInt(id as string));

  useEffect(() => {
    if (id) {
      setCurrentChat(parseInt(id as string));
    }
  }, [id, setCurrentChat]);

  const clearUnreadOnBlur = useCallback(() => {
    return () => {
      if (!chat) return;
      setChats((prevChats) => {
        const updatedChats = prevChats.map((c) => {
          if (c.id === parseInt(id as string)) {
            for (const msg of c.messages) {
              if (msg.unread && msg.type === "text") {
                msg.unread = false; // Mark all messages as read
              }
            }
            c.unreadCount = 0; // Reset unread count
          }
          return c;
        });
        return updatedChats;
      });
    };
  }, [ id, setCurrentChat, setChats, chat ]);

  useFocusEffect(clearUnreadOnBlur);

  if (!chat) {
    return (
      <SafeAreaView className="flex-1 bg-black">
        <Text className="text-typography-white text-center mt-10">Chat not found</Text>
      </SafeAreaView>
    );
  }

  const sendMessage = async () => {
    if (message.trim()) {
      try {
        console.log("Sending message:", message);
        const textBuffer = new TextEncoder().encode(message.trim()).buffer as ArrayBuffer;
        setMessage("");
        const recipient = chat.username;
        const { publicKey: recipientKey } = await getPublicKey(recipient);
        const { encryptedContent: encryptedImage, encryptedAESKey, iv } = await encryptContent(textBuffer, recipientKey);
        await sendEncryptedMessage({
          senderId: username!,
          recipientId: recipient,
          iv,
          encryptedKey: encryptedAESKey,
          content: encryptedImage,
          type: "text",
          timestamp: Date.now(),
        });
        if (chat.id !== 1) {
          updateChat(parseInt(id as string), {
            ...chat,
            messages: [
              ...chat.messages,
              {
                id: Date.now(),
                content: message.trim(),
                type: "text",
                isMe: true,
                timestamp: new Date(),
                unread: false,
              },
            ],
          });
        }
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <StatusBar style="light" />
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
            <MessageBubble key={msg.id} message={msg} chatId={chat.id} />
          ))}
        </ScrollView>

        <Box className="bg-black px-4 py-3 border-t border-outline-700">
          <Box className="flex-row items-end gap-2">
            <TouchableOpacity className="mr-1.5 mb-1.5">
              <Ionicons name="attach" size={26} color="#aaa" />
            </TouchableOpacity>

            <Box className="flex-1 flex-row items-center bg-zinc-800 rounded-full px-3" style={{ minHeight: 40 }}>
              <TextInput
                className="flex-1 text-typography-white text-base outline-none h-[29px]"
                placeholder="Type a message..."
                placeholderTextColor="#666"
                value={message}
                onChangeText={setMessage}
                multiline
                autoCorrect={false}
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
                <TouchableOpacity className="ml-3">
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
