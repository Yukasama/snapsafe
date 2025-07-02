import { Box } from "@/components/ui/box";
import { TouchableOpacity, Alert } from "react-native";
import { Text } from "@/components/ui/text";
import { useRouter } from "expo-router";
import { Swipeable } from "react-native-gesture-handler";
import { Chat } from "@/context/ChatContext";

export const ChatItem = ({
  chat,
  isEditMode,
  isSelected,
  onToggleSelect,
  onDelete,
}: {
  chat: Chat;
  isEditMode: boolean;
  isSelected: boolean;
  onToggleSelect: (id: number) => void;
  onDelete: (id: number) => void;
}) => {
  const router = useRouter();
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

  const handlePress = () => {
    if (chat.messages && chat.messages.filter((msg) => msg.type === "image" && msg.unread).length > 0) {
      // Navigate to the photo viewer with the latest unread image
      router.push({
        pathname: "/view-photo",
        params: {
          chatId: chat.id,
        },
      });
    } else {
      router.push(`/chat/${chat.id}`);
    }
  };

  const renderRightActions = () => (
    <TouchableOpacity onPress={handleDelete} className="bg-red-500 items-center justify-center px-6">
      <Text className="text-white text-xl">🗑️</Text>
      <Text className="text-white text-sm font-medium">Delete</Text>
    </TouchableOpacity>
  );

  const lastMessageObj = chat.messages.slice(-1)[0];
  let lastMessageText;
  if (lastMessageObj && lastMessageObj.type === "image" && lastMessageObj.unread) {
    lastMessageText = "Photo received";
  } else {
    lastMessageText = lastMessageObj ? lastMessageObj.content : "No messages yet";
  }

  let lastMessageTimestamp;
  if (lastMessageObj) {
    const date = new Date(lastMessageObj.timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) {
      lastMessageTimestamp = "Just now";
    } else if (minutes < 60) {
      lastMessageTimestamp = `${minutes}m ago`;
    } else if (minutes < 1440) { // 24 hours
      lastMessageTimestamp = `${Math.floor(minutes / 60)}h ago`;
    } else if (minutes < 10080) { // 7 days
      lastMessageTimestamp = `${Math.floor(minutes / 1440)}d ago`;
    } else {
      lastMessageTimestamp = date.toLocaleDateString("de-DE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    }
  } else {
    lastMessageTimestamp = "No messages yet";
  }


  if (isEditMode) {
    return (
      <TouchableOpacity onPress={() => onToggleSelect(chat.id)}>
        <Box className="flex-row items-center p-4 border-b border-outline-700">
          <TouchableOpacity className="mr-3" onPress={() => onToggleSelect(chat.id)}>
            <Box
              className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                isSelected ? "bg-blue-500 border-blue-500" : "border-typography-400"
              }`}
            >
              {isSelected && <Text className="text-white text-xs font-bold">✓</Text>}
            </Box>
          </TouchableOpacity>

          <Box className="relative">
            <Box className="w-12 h-12 rounded-full bg-background-200 items-center justify-center">
              <Text className="text-2xl">{chat.avatar}</Text>
            </Box>
            {chat.isOnline && (
              <Box className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-black" />
            )}
          </Box>

          <Box className="flex-1 ml-3">
            <Box className="flex-row justify-between items-center">
              <Text className="text-typography-white font-medium text-lg">{chat.name}</Text>
              <Text className="text-typography-400 text-sm">{lastMessageTimestamp}</Text>
            </Box>
            <Box className="flex-row justify-between items-center mt-1">
              <Text className="text-typography-400 text-sm flex-1 mr-2" numberOfLines={1}>
                {lastMessageText}
              </Text>
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
      <TouchableOpacity onPress={handlePress}>
        <Box className="flex-row items-center p-4 border-b border-outline-700 bg-black">
          <Box className="relative">
            <Box className="w-12 h-12 rounded-full bg-background-200 items-center justify-center">
              <Text className="text-2xl">{chat.avatar}</Text>
            </Box>
            {chat.isOnline && (
              <Box className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-black" />
            )}
          </Box>

          <Box className="flex-1 ml-3">
            <Box className="flex-row justify-between items-center">
              <Text className="text-typography-white font-medium text-lg">{chat.name}</Text>
              <Text className="text-typography-400 text-sm">{lastMessageTimestamp}</Text>
            </Box>
            <Box className="flex-row justify-between items-center mt-1">
              <Text className="text-typography-400 text-sm flex-1 mr-2" numberOfLines={1}>
                {lastMessageText}
              </Text>
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
    </Swipeable>
  );
};
