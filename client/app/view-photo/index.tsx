import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, Image, StyleSheet } from "react-native";
import { useChats } from "@/context/ChatContext";

export default function PhotoViewerScreen() {
  const { chatId } = useLocalSearchParams<{ chatId: string }>();
  const id = Number(chatId);
  const router = useRouter();
  const { getChatById, updateChat } = useChats();

  const chat = getChatById(id);
  const [images, setImages] = useState<string[]>(() =>
    chat?.unreadImages.slice() ?? []
  );
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!images.length) {
      router.back();
    }
  }, []);

  const current = images[index];
  const uri = current ? `data:image/jpeg;base64,${current}` : null;
  if (!uri) return null;

  const handleTap = () => {
    // remove from local
    setImages((prev) => prev.filter((_, i) => i !== index));

    // remove from context + decrement count
    updateChat(id, {
      unreadImages: chat!.unreadImages.filter((_, i) => i !== index),
      unreadCount: Math.max(chat!.unreadCount - 1, 0),
    });

    // advance to next – if none left, go back
    if (index < images.length - 1) {
      // same index now points at next item
      setIndex(index);
    } else {
      router.back();
    }
  };

  return (
    <Pressable style={styles.container} onPress={handleTap}>
      <Image source={{ uri }} style={styles.image} resizeMode="contain" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "black" },
  image: { width: "100%", height: "100%" },
});

