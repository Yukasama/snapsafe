import { useState, useMemo, useRef } from "react";
import { Box } from "@/components/ui/box";
import { ScrollView, TouchableOpacity, TextInput, Alert } from "react-native";
import { Text } from "@/components/ui/text";
import { Link } from "expo-router";
import { useRouter } from "expo-router";
import { Swipeable } from "react-native-gesture-handler";

// Mock chat data - replace with real data later
const mockChats = [
  {
    id: 1,
    name: "John Doe",
    lastMessage: "Hey, how are you doing?",
    timestamp: "2m ago",
    unreadCount: 2,
    avatar: "👨‍💼",
    isOnline: true,
  },
  {
    id: 2,
    name: "Sarah Wilson",
    lastMessage: "Can we meet tomorrow?",
    timestamp: "5m ago",
    unreadCount: 0,
    avatar: "👩‍🎨",
    isOnline: true,
  },
  {
    id: 3,
    name: "Team Group",
    lastMessage: "Mike: Great work everyone!",
    timestamp: "1h ago",
    unreadCount: 5,
    avatar: "👥",
    isOnline: false,
  },
  {
    id: 4,
    name: "Mom",
    lastMessage: "Don't forget dinner at 7pm",
    timestamp: "2h ago",
    unreadCount: 1,
    avatar: "👩‍🦳",
    isOnline: false,
  },
  {
    id: 5,
    name: "Alex Johnson",
    lastMessage: "Thanks for the help!",
    timestamp: "1d ago",
    unreadCount: 0,
    avatar: "👨‍💻",
    isOnline: false,
  },
  {
    id: 6,
    name: "Emma Davis",
    lastMessage: "See you at the party 🎉",
    timestamp: "2d ago",
    unreadCount: 0,
    avatar: "👩‍🦰",
    isOnline: true,
  },
];

const ChatItem = ({
  chat,
  isEditMode,
  isSelected,
  onToggleSelect,
  onDelete,
}: {
  chat: (typeof mockChats)[0];
  isEditMode: boolean;
  isSelected: boolean;
  onToggleSelect: (id: number) => void;
  onDelete: (id: number) => void;
}) => {
  const handleDelete = () => {
    Alert.alert("Delete Chat", `Are you sure you want to delete the chat with ${chat.name}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => onDelete(chat.id),
      },
    ]);
  };

  const renderRightActions = () => (
    <TouchableOpacity onPress={handleDelete} className="bg-red-500 items-center justify-center px-6">
      <Text className="text-white text-xl">🗑️</Text>
      <Text className="text-white text-sm font-medium">Delete</Text>
    </TouchableOpacity>
  );
  if (isEditMode) {
    return (
      <TouchableOpacity onPress={() => onToggleSelect(chat.id)}>
        <Box className="flex-row items-center p-4 border-b border-outline-700">
          {/* Checkbox */}
          <TouchableOpacity className="mr-3" onPress={() => onToggleSelect(chat.id)}>
            <Box
              className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                isSelected ? "bg-blue-500 border-blue-500" : "border-typography-400"
              }`}
            >
              {isSelected && <Text className="text-white text-xs font-bold">✓</Text>}
            </Box>
          </TouchableOpacity>

          {/* Avatar */}
          <Box className="relative">
            <Box className="w-12 h-12 rounded-full bg-background-200 items-center justify-center">
              <Text className="text-2xl">{chat.avatar}</Text>
            </Box>
            {/* Online indicator */}
            {chat.isOnline && (
              <Box className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-black" />
            )}
          </Box>

          {/* Chat info */}
          <Box className="flex-1 ml-3">
            <Box className="flex-row justify-between items-center">
              <Text className="text-typography-white font-medium text-lg">{chat.name}</Text>
              <Text className="text-typography-400 text-sm">{chat.timestamp}</Text>
            </Box>
            <Box className="flex-row justify-between items-center mt-1">
              <Text className="text-typography-400 text-sm flex-1 mr-2" numberOfLines={1}>
                {chat.lastMessage}
              </Text>
              {/* Unread count */}
              {chat.unreadCount > 0 && (
                <Box className="bg-blue-500 rounded-full min-w-[20px] h-5 items-center justify-center px-2">
                  <Text className="text-white text-xs font-medium">
                    {chat.unreadCount > 99 ? "99+" : chat.unreadCount}
                  </Text>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </TouchableOpacity>
    );
  }

  return (
    <Swipeable renderRightActions={renderRightActions}>
      <Link href={`/chat/${chat.id}`} asChild>
        <TouchableOpacity>
          <Box className="flex-row items-center p-4 border-b border-outline-700 bg-black">
            {/* Avatar */}
            <Box className="relative">
              <Box className="w-12 h-12 rounded-full bg-background-200 items-center justify-center">
                <Text className="text-2xl">{chat.avatar}</Text>
              </Box>
              {/* Online indicator */}
              {chat.isOnline && (
                <Box className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-black" />
              )}
            </Box>

            {/* Chat info */}
            <Box className="flex-1 ml-3">
              <Box className="flex-row justify-between items-center">
                <Text className="text-typography-white font-medium text-lg">{chat.name}</Text>
                <Text className="text-typography-400 text-sm">{chat.timestamp}</Text>
              </Box>
              <Box className="flex-row justify-between items-center mt-1">
                <Text className="text-typography-400 text-sm flex-1 mr-2" numberOfLines={1}>
                  {chat.lastMessage}
                </Text>
                {/* Unread count */}
                {chat.unreadCount > 0 && (
                  <Box className="bg-blue-500 rounded-full min-w-[20px] h-5 items-center justify-center px-2">
                    <Text className="text-white text-xs font-medium">
                      {chat.unreadCount > 99 ? "99+" : chat.unreadCount}
                    </Text>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        </TouchableOpacity>
      </Link>
    </Swipeable>
  );
};

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedChats, setSelectedChats] = useState<number[]>([]);
  const [chats, setChats] = useState(mockChats);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const router = useRouter();

  // Filter chats based on search query
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
      {/* Header */}
      <Box className="bg-black pt-4 pb-4 px-4 border-b border-outline-700">
        <Box className="flex-row justify-between items-center mb-4">
          {isEditMode ? (
            <>
              <TouchableOpacity onPress={handleCancelEdit}>
                <Text className="text-blue-500 text-lg">Cancel</Text>
              </TouchableOpacity>
              <Text className="text-typography-white font-bold text-lg">{selectedChats.length} Selected</Text>
              <TouchableOpacity onPress={handleDeleteSelected} disabled={selectedChats.length === 0}>
                <Text className={`text-lg ${selectedChats.length > 0 ? "text-red-500" : "text-typography-400"}`}>
                  Delete
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              {/* Profile Icon */}
              <TouchableOpacity onPress={() => setShowProfileDropdown(!showProfileDropdown)}>
                <Box className="w-10 h-10 rounded-full bg-blue-500 items-center justify-center">
                  <Text className="text-white font-bold text-lg">J</Text>
                </Box>
              </TouchableOpacity>

              {/* Action buttons */}
              <Box className="flex-row gap-4 items-center">
                <TouchableOpacity>
                  <Text className="text-typography-white text-xl">💬</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setIsEditMode(true)}>
                  <Text className="text-typography-white text-xl">⋯</Text>
                </TouchableOpacity>
              </Box>
            </>
          )}
        </Box>

        {/* Chats title - only show when not in edit mode */}
        {!isEditMode && (
          <Box className="flex-row">
            <Text className="text-typography-white font-bold text-2xl">Chats</Text>
          </Box>
        )}

        {/* Profile Dropdown */}
        {showProfileDropdown && <ProfileDropdown />}
      </Box>

      {/* Search bar */}
      <Box className="px-4 py-3 bg-black">
        <Box className="bg-background-800 rounded-full px-4 py-2 flex-row items-center">
          <Text className="text-typography-400 mr-3">🔍</Text>
          <TextInput
            className="flex-1 text-typography-white text-base"
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

      {/* Chat list */}
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

      {/* Floating action button */}
      {!isEditMode && (
        <Box className="absolute bottom-6 right-6">
          <Link href="/camera" asChild>
            <TouchableOpacity>
              <Box className="w-14 h-14 bg-blue-500 rounded-full items-center justify-center shadow-lg">
                <Text className="text-white text-2xl">�</Text>
              </Box>
            </TouchableOpacity>
          </Link>
        </Box>
      )}

      {/* Backdrop for dropdown */}
      {showProfileDropdown && (
        <TouchableOpacity className="absolute inset-0 bg-transparent" onPress={() => setShowProfileDropdown(false)} />
      )}
    </Box>
  );
}
