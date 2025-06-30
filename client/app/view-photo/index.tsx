import { useLocalSearchParams, router } from "expo-router";
import { Image, Pressable, StyleSheet, View } from "react-native";
import React from "react";

export default function PhotoViewerScreen() {
  const { imageUri, base64Image } = useLocalSearchParams();

  const uri =
    typeof base64Image === "string"
      ? `data:image/jpeg;base64,${base64Image}`
      : typeof imageUri === "string"
      ? imageUri
      : null;

  if (!uri) return null;

  return (
    <Pressable style={styles.container} onPress={() => router.back()}>
      <Image source={{ uri }} style={styles.image} resizeMode="contain" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  image: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
});

