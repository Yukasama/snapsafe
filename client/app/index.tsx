import React, { useState, useMemo } from "react";
import { Box } from "@/components/ui/box";
import { ScrollView, TouchableOpacity, TextInput } from "react-native";
import { Text } from "@/components/ui/text";
import { Link } from "expo-router";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ChatItem } from "@/components/ChatItem";
import { mockChats } from "@/config/mock-chats";
import { useMessagePolling } from "@/hooks/useMessagePolling";
import { getLatestEncryptedMessages } from "@/api/backend";
import { config } from "@/config/config";
import { decryptImage } from "@/crypto/decryptImage";
import { loadOrCreateRSAKeyPair } from "@/crypto/keyManager";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedChats, setSelectedChats] = useState<number[]>([]);
  const [chats, setChats] = useState(mockChats);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const router = useRouter();

  useMessagePolling(async () => {
    const messages = await getLatestEncryptedMessages(config.username);
    if (!messages || messages.length === 0) return;
    const pair = await loadOrCreateRSAKeyPair();
    const privateKey = pair.privateKey;
    for (const message of messages) {
      console.debug("Decrypting message");
      const decryptedMessage = await decryptImage(
        message.image,
        message.encryptedKey,
        message.iv,
        privateKey
      )
      router.push({
        pathname: "/view-photo",
        params: {
          base64Image: decryptedMessage,
        },
      });
    }
  })

  const filteredChats = useMemo(() => {
    if (!searchQuery.trim()) return chats;

    return chats.filter(
      (chat) =>
        chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [chats, searchQuery]);

  const handleToggleSelect = (chatId: number) => {
    setSelectedChats((prev) => (prev.includes(chatId) ? prev.filter((id) => id !== chatId) : [...prev, chatId]));
  };

  const handleDeleteSelected = () => {
    setChats((prev) => prev.filter((chat) => !selectedChats.includes(chat.id)));
    setSelectedChats([]);
    setIsEditMode(false);
  };

  const handleDeleteChat = (chatId: number) => {
    setChats((prev) => prev.filter((chat) => chat.id !== chatId));
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setSelectedChats([]);
  };

  const ProfileDropdown = () => (
    <Box className="absolute top-20 left-4 bg-background-800 rounded-lg border border-outline-700 shadow-lg z-50">
      <TouchableOpacity
        onPress={() => {
          setShowProfileDropdown(false);
          router.push("/shop");
        }}
        className="p-4 border-b border-outline-700"
      >
        <Text className="text-typography-white text-base">🛍️ Shop</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {
          setShowProfileDropdown(false);
          router.push("/settings");
        }}
        className="p-4"
      >
        <Text className="text-typography-white text-base">⚙️ Settings</Text>
      </TouchableOpacity>
    </Box>
  );

  return (
    <Box className="flex-1 bg-black">
      <Box className="bg-black pt-4 pb-4 px-5 border-b border-outline-700">
        <Box className="flex-row justify-between items-center mb-4">
          {isEditMode ? (
            <>
              <TouchableOpacity onPress={handleCancelEdit}>
                <Text className="text-blue-500 text-md">Cancel</Text>
              </TouchableOpacity>
              <Text className="text-typography-white font-bold text-md">{selectedChats.length} Selected</Text>
              <TouchableOpacity onPress={handleDeleteSelected} disabled={selectedChats.length === 0}>
                <Text className={`text-md ${selectedChats.length > 0 ? "text-red-500" : "text-typography-400"}`}>
                  Delete
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity onPress={() => setShowProfileDropdown(!showProfileDropdown)}>
                <Box className="w-10 h-10 rounded-full bg-blue-500 items-center justify-center">
                  <Text className="text-white font-bold text-lg">J</Text>
                </Box>
              </TouchableOpacity>

              <Box className="flex-row gap-4 items-center">
                <TouchableOpacity>
                  <Ionicons name="chatbubble-outline" size={24} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setIsEditMode(true)}>
                  <Ionicons name="ellipsis-horizontal" size={20} color="#fff" />
                </TouchableOpacity>
              </Box>
            </>
          )}
        </Box>

        {!isEditMode && (
          <Box className="flex-row">
            <Text className="text-typography-white font-bold text-2xl">Chats</Text>
          </Box>
        )}
      </Box>

      {showProfileDropdown && <ProfileDropdown />}

      <Box className="px-4 py-3 bg-black">
        <Box className="bg-background-800 rounded-full px-4 py-2 flex-row items-center">
          <Ionicons name="search" size={20} color="#999" style={{ marginRight: 12 }} />
          <TextInput
            className="flex-1 text-typography-white text-base outline-none"
            placeholder="Search chats..."
            placeholderTextColor="#666666"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")} className="ml-2">
              <Text className="text-typography-400 text-lg">×</Text>
            </TouchableOpacity>
          )}
        </Box>
      </Box>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {filteredChats.length > 0 ? (
          filteredChats.map((chat) => (
            <ChatItem
              key={chat.id}
              chat={chat}
              isEditMode={isEditMode}
              isSelected={selectedChats.includes(chat.id)}
              onToggleSelect={handleToggleSelect}
              onDelete={handleDeleteChat}
            />
          ))
        ) : (
          <Box className="flex-1 items-center justify-center py-20">
            <Text className="text-typography-400 text-lg">{searchQuery ? "No chats found" : "No chats yet"}</Text>
          </Box>
        )}
      </ScrollView>

      {!isEditMode && (
        <Box className="absolute bottom-6 right-6">
          <Link href="/camera" asChild>
            <TouchableOpacity>
              <Box className="w-14 h-14 bg-blue-500 rounded-full items-center justify-center shadow-lg">
                <Ionicons name="camera" size={32} color="#fff" />
              </Box>
            </TouchableOpacity>
          </Link>
        </Box>
      )}

      {showProfileDropdown && (
        <TouchableOpacity className="absolute inset-0 bg-transparent" onPress={() => setShowProfileDropdown(false)} />
      )}
    </Box>
  );
}
