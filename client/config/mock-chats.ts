import { Chat } from "@/context/ChatContext";
import { useUser } from "@/context/UserContext";

export const getMockChats = (): Chat[] => {
  const { username } = useUser();

  const mockChats: Chat[] = [
    {
      id: 1,
      name: "Note to Self",
      unreadCount: 0,
      avatar: "📝",
      isOnline: true,
      username: username!,
      messages: [
        {
          id: 1,
          content: "Don't forget to call the plumber",
          timestamp: new Date("2025-07-02T12:00:00Z"),
          isMe: true,
          type: "text",
          unread: false,
        },
        {
          id: 2,
          content: "Also, remember to water the plants",
          timestamp: new Date("2025-07-02T12:05:00Z"),
          isMe: true,
          type: "text",
          unread: false,
        },
        {
          id: 3,
          content: "Photo received",
          timestamp: new Date("2025-07-02T12:09:00Z"),
          isMe: true,
          type: "image",
          unread: false,
        },
      ],
    },
    {
      id: 2,
      name: "Sarah Wilson",
      unreadCount: 0,
      avatar: "👩‍🎨",
      isOnline: true,
      username: "",
      messages: [
        {
          id: 1,
          content: "Sure, what time works for you?",
          timestamp: new Date("2025-07-02T11:50:00Z"),
          isMe: true,
          type: "text",
          unread: false,
        },
        {
          id: 2,
          content: "How about 3 PM?",
          timestamp: new Date("2025-07-02T11:55:00Z"),
          isMe: false,
          type: "text",
          unread: false,
        },
      ],
    },
    {
      id: 4,
      name: "Mom",
      unreadCount: 0,
      avatar: "👩‍🦳",
      isOnline: false,
      username: "",
      messages: [
        {
          id: 1,
          content: "Also, bring the dessert!",
          timestamp: new Date("2025-07-02T10:30:00Z"),
          isMe: false,
          type: "text",
          unread: false,
        },
      ],
    },
    {
      id: 5,
      name: "Alex Johnson",
      unreadCount: 0,
      avatar: "👨‍💻",
      isOnline: false,
      username: "",
      messages: [
        {
          id: 1,
          content: "I really appreciate your support on the project.",
          timestamp: new Date("2025-07-02T10:00:00Z"),
          isMe: true,
          type: "text",
          unread: false,
        },
        {
          id: 2,
          content: "Let's catch up next week!",
          timestamp: new Date("2025-07-02T10:05:00Z"),
          isMe: false,
          type: "text",
          unread: false,
        },
      ],
    },
    {
      id: 6,
      name: "Emma Davis",
      unreadCount: 0,
      avatar: "👩‍🦰",
      isOnline: true,
      username: "",
      messages: [
        {
          id: 1,
          content: "Can't wait! It's going to be so much fun.",
          timestamp: new Date("2025-07-02T09:00:00Z"),
          isMe: false,
          type: "text",
          unread: false,
        },
        {
          id: 2,
          content: "I'll bring the drinks!",
          timestamp: new Date("2025-07-02T09:05:00Z"),
          isMe: true,
          type: "text",
          unread: false,
        },
      ],
    },
    {
      id: 7,
      name: "Marius M",
      unreadCount: 0,
      avatar: "👩‍🦰",
      isOnline: true,
      username: "987654321",
      messages: [
        {
          id: 1,
          content: "Can't wait! It's going to be so much fun.",
          timestamp: new Date("2025-07-02T09:00:00Z"),
          isMe: false,
          type: "text",
          unread: false,
        },
        {
          id: 2,
          content: "I'll bring the drinks!",
          timestamp: new Date("2025-07-02T09:05:00Z"),
          isMe: true,
          type: "text",
          unread: false,
        },
      ],
    },
    {
      id: 8,
      name: "AFa",
      unreadCount: 0,
      avatar: "👩‍🦰",
      isOnline: true,
      username: "3141592",
      messages: [
        {
          id: 1,
          content: "Can't wait! It's going to be so much fun.",
          timestamp: new Date("2025-07-02T09:00:00Z"),
          isMe: false,
          type: "text",
          unread: false,
        },
        {
          id: 2,
          content: "I'll bring the drinks!",
          timestamp: new Date("2025-07-02T09:05:00Z"),
          isMe: true,
          type: "text",
          unread: false,
        },
      ],
    },
  ];

  return mockChats;
};
