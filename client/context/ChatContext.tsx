import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from "react";
import { getInitialChats, initialChats } from "@/config/mock-chats";
import { getLatestEncryptedMessages } from "@/api/backend";
import { useMessagePolling } from "@/hooks/useMessagePolling";
import { decryptContent, decryptText } from "@/crypto/decryptContent";
import { loadOrCreateRSAKeyPair } from "@/crypto/keyManager";
import { useUser } from "@/context/UserContext";

export interface Chat {
  id: number;
  name: string;
  username: string;
  avatar: string;
  isOnline: boolean;
  unreadCount: number;
  messages: Message[]
}

export interface Message {
  id: number;
  timestamp: Date;
  isMe: boolean;
  type: "text" | "image";
  content: string | ArrayBuffer;
  unread: boolean;
}

interface ChatContextValue {
  chats: Chat[];
  setChats: React.Dispatch<React.SetStateAction<Chat[]>>;
  getChatById: (id: number) => Chat | undefined;
  updateChat: (id: number, updates: Partial<Chat>) => void;
  setCurrentChat: (id: number | null) => void;
  getCurrentChat: () => Chat | null;
}

const sortByLastMessage = (a: Chat, b: Chat) => {
  const aLastMessage = a.messages?.[a.messages.length - 1]?.timestamp || new Date(0);
  const bLastMessage = b.messages?.[b.messages.length - 1]?.timestamp || new Date(0);
  return new Date(bLastMessage).getTime() - new Date(aLastMessage).getTime();
}

const ChatContext = createContext<ChatContextValue | null>(null);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { username, isLoading } = useUser();


  const [currentChatId, setCurrentChatId] = useState<number | null>(null);

  const [chats, setChats] = useState<Chat[]>([]);

  useEffect(() => {
    if (isLoading || !username) return;

    const filtered = initialChats
      .map(c =>
        c.id === 1
          ? { ...c, username }
          : c
      )
      .filter(c => c.id === 1 || c.username !== username)
      .sort(sortByLastMessage)
      .map(c => ({ ...c }));

    setChats(filtered);
  }, [isLoading, username]);

  const getChatById = useCallback(
    (id: number) => {
      return chats.find((chat) => chat.id === id);
    },
    [chats]
  );

  const updateChat = useCallback((id: number, updates: Partial<Chat>) => {
    setChats((prev) =>
      prev.map((chat) => (chat.id === id ? { ...chat, ...updates } : chat)).sort(sortByLastMessage)
    );
  }, []);

  const setCurrentChat = useCallback((id: number | null) => {
    setCurrentChatId(id);
  }, []);

  const getCurrentChat = useCallback(() => {
    return currentChatId === null
      ? null
      : chats.find(c => c.id === currentChatId) ?? null;
  }, [chats, currentChatId]);

  // Memoize the context value
  const contextValue = useMemo(
    () => ({ chats, setChats, getChatById, updateChat, setCurrentChat, getCurrentChat }),
    [chats, setChats, getChatById, updateChat, setCurrentChat, getCurrentChat]
  );

  useMessagePolling(async () => {
    if (!username) return;

    const messages = await getLatestEncryptedMessages(username);
    if (!messages?.length) return;
    const { privateKey } = await loadOrCreateRSAKeyPair();

    for (const message of messages.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())) {
      let decryptedMessage;
      if (message.type === "image") {
        decryptedMessage = await decryptContent(
          message.content,
          message.encryptedKey,
          message.iv,
          privateKey
        );
      } else {
        decryptedMessage = await decryptText(
          message.content,
          message.encryptedKey,
          message.iv,
          privateKey
        );
      }

      setChats((prev) => {
        const existingChat = prev.find((chat) => chat.username === message.from);
        if (existingChat) {
          return prev.map((chat) =>
            chat.username === message.from
              ? {
                ...chat,
                unreadCount: chat.unreadCount + 1,
                messages: [
                  ...(chat.messages || []),
                  {
                    id: Date.now(),
                    timestamp: new Date(message.timestamp),
                    isMe: chat.username === username,
                    type: message.type,
                    content: decryptedMessage,
                    unread: true,
                  },
                ],
              }
              : chat
          ).sort(sortByLastMessage);
        } else {
          return [
            ...prev,
            {
              id: Date.now(),
              name: message.from,
              username: message.from,
              avatar: "👤",
              unreadCount: 1,
              isOnline: false,
              messages: [
                {
                  id: Date.now(),
                  timestamp: new Date(message.timestamp),
                  isMe: false,
                  type: message.type,
                  content: decryptedMessage,
                  unread: true,
                },
              ],
            },
          ].sort(sortByLastMessage);
        }
      });
    }
  });

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
};

export function useChats() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChats must be used inside ChatProvider");
  return ctx;
}
