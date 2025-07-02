import React, { createContext, useContext, useState, useCallback } from "react";
import { useMockChats } from "@/config/mock-chats";
import { getLatestEncryptedMessages } from "@/api/backend";
import { useMessagePolling } from "@/hooks/useMessagePolling";
import { decryptImage } from "@/crypto/decryptImage";
import { loadOrCreateRSAKeyPair } from "@/crypto/keyManager";
import { useUser } from "@/context/UserContext";

export interface Chat {
  id: number;
  name: string;
  username: string;
  avatar: string;
  isOnline: boolean;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  unreadImages: any[];
}

interface ChatContextValue {
  chats: Chat[];
  setChats: React.Dispatch<React.SetStateAction<Chat[]>>;
  getChatById: (id: number) => Chat | undefined;
  updateChat: (id: number, updates: Partial<Chat>) => void;
  currentChat: Chat | null;
  setCurrentChat: React.Dispatch<React.SetStateAction<Chat | null>>;
}

const ChatContext = createContext<ChatContextValue | null>(null);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { username } = useUser();
  const initialChats = useMockChats();
  const [chats, setChats] = useState<Chat[]>(() =>
    initialChats.map((c) => ({ ...c }))
  );
  const [currentChat, setCurrentChat] = useState<Chat | null>(null); // Added this line

  const getChatById = useCallback(
    (id: number) => {
      return chats.find((chat) => chat.id === id);
    },
    [chats]
  );

  const updateChat = useCallback((id: number, updates: Partial<Chat>) => {
    setChats((prev) =>
      prev.map((chat) => (chat.id === id ? { ...chat, ...updates } : chat))
    );
  }, []);

  useMessagePolling(async () => {
    if (!username) return;
    
    const messages = await getLatestEncryptedMessages(username);
    if (!messages?.length) return;
    const { privateKey } = await loadOrCreateRSAKeyPair();

    for (const message of messages) {
      const decryptedImage = await decryptImage(
        message.image,
        message.encryptedKey,
        message.iv,
        privateKey
      );

      setChats((prev) => {
        const existingChat = prev.find((chat) => chat.username === message.from);
        if (existingChat) {
          return prev.map((chat) =>
            chat.username === message.from
              ? {
                  ...chat,
                  lastMessage: "New photo received",
                  timestamp: new Date().toLocaleTimeString(),
                  unreadCount: chat.unreadCount + 1,
                  unreadImages: [...(chat.unreadImages || []), decryptedImage],
                }
              : chat
          );
        } else {
          return [
            ...prev,
            {
              id: Date.now(),
              name: message.from,
              username: message.from,
              avatar: "👤",
              lastMessage: "New photo received",
              timestamp: new Date().toISOString(),
              unreadCount: 1,
              isOnline: false,
              unreadImages: [decryptedImage],
            },
          ];
        }
      });
    }
  });

  return (
    <ChatContext.Provider value={{ chats, setChats, getChatById, updateChat, currentChat, setCurrentChat }}>
      {children}
    </ChatContext.Provider>
  );
};

export function useChats() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChats must be used inside ChatProvider");
  return ctx;
}
