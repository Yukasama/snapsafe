import React, { createContext, useContext, useState, useCallback } from "react";
import { mockChats } from "@/config/mock-chats";
import { getLatestEncryptedMessages } from "@/api/backend";
import { useMessagePolling } from "@/hooks/useMessagePolling";
import { decryptImage } from "@/crypto/decryptImage";
import { loadOrCreateRSAKeyPair } from "@/crypto/keyManager";
import { config } from "@/config/config";

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
  setCurrentChat: (id: number | null) => void;
  getCurrentChat: () => Chat | null;
}

const ChatContext = createContext<ChatContextValue | null>(null);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  const [currentChat, setCurrChat] = useState<Chat | null>(null);

  const [chats, setChats] = useState<Chat[]>(() =>
    mockChats.map((c) => ({ ...c }))
  );

  const getChatById = useCallback((id: number) => {
    return chats.find((chat) => chat.id === id);
  }, [chats]);

  const updateChat = useCallback((id: number, updates: Partial<Chat>) => {
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === id ? { ...chat, ...updates } : chat
      )
    );
  }, []);

  const setCurrentChat = useCallback((id: number | null) => {
    if (id === null) {
      setCurrChat(null);
      return;
    }
    const chat = getChatById(id);
    if (chat) {
      setCurrChat(chat);
    }
  }, [getChatById]);

  const getCurrentChat = useCallback(() => {
    return currentChat;
  }, [currentChat]);

  useMessagePolling(async () => {
    const messages = await getLatestEncryptedMessages(config.username);
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
    <ChatContext.Provider value={{ chats, setChats, getChatById, updateChat, setCurrentChat, getCurrentChat }}>
      {children}
    </ChatContext.Provider>
  );
};

export function useChats() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChats must be used inside ChatProvider");
  return ctx;
}

