import React, { useState, useEffect } from "react";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { TouchableOpacity, Image, Dimensions, ScrollView, View } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { useAnimatedStyle, useSharedValue, runOnJS, withSpring, clamp } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { captureRef } from "react-native-view-shot";
import { StatusBar } from "expo-status-bar";

const { width, height } = Dimensions.get("window");

const emojiCategories = {
  faces: ["😀", "😍", "🥰", "😎", "🤔", "😴", "🤪", "🙃"],
  reactions: ["🔥", "💯", "👍", "👎", "💪", "🙌", "👏", "✌️"],
  hearts: ["❤️", "💕", "💖", "💗", "💙", "💚", "💛", "🧡"],
  fun: ["🎉", "✨", "🌟", "⚡", "💥", "🎊", "🎈", "🎁"],
  nature: ["🌈", "☀️", "🌙", "⭐", "🌸", "🌺", "🦋", "🐝"],
} as const;
type CategoryKey = keyof typeof emojiCategories;

interface Sticker {
  id: string;
  emoji: string;
  x: number;
  y: number;
  scale: number;
}

const HEADER_HEIGHT = 100;
const BOTTOM_CONTROLS_HEIGHT = 200;
const TRASH_SIZE = 60;
const TRASH_ZONE = { w: 100, h: 100 };

export default function PhotoEditorScreen() {
  const { imageUri } = useLocalSearchParams<{ imageUri: string }>();
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [category, setCategory] = useState<CategoryKey>("faces");
  const [overTrashGlobal, setOverTrashGlobal] = useState(false);
  const photoCanvasRef = React.useRef(null);

  const updateStickerPosition = (id: string, x: number, y: number) => {
    setStickers((prev) => prev.map((s) => (s.id === id ? { ...s, x, y } : s)));
  };

  const updateStickerScale = (id: string, scale: number) => {
    setStickers((prev) => prev.map((s) => (s.id === id ? { ...s, scale } : s)));
  };

  const addSticker = (emoji: string) => {
    const photoH = height - HEADER_HEIGHT - BOTTOM_CONTROLS_HEIGHT;
    setStickers((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        emoji,
        x: Math.random() * (width - 60),
        y: Math.random() * (photoH - 60) + 20,
        scale: 0.8 + Math.random() * 0.4,
      },
    ]);
  };

  const removeSticker = (id: string) => setStickers((prev) => prev.filter((s) => s.id !== id));

  const StickerItem = ({ sticker }: { sticker: Sticker }) => {
    const tx = useSharedValue(sticker.x);
    const ty = useSharedValue(sticker.y);
    const sc = useSharedValue(sticker.scale);

    useEffect(() => {
      tx.value = sticker.x;
      ty.value = sticker.y;
      sc.value = sticker.scale;
    }, [sticker]);

    const offset = React.useRef({ x: 0, y: 0 });
    const pan = Gesture.Pan()
      .minDistance(0)
      .onBegin((e) => {
        sc.value = withSpring(sticker.scale * 1.2);
        runOnJS(setOverTrashGlobal)(false);
        offset.current = {
          x: e.absoluteX - tx.value,
          y: e.absoluteY - ty.value,
        };
      })
      .onUpdate((e) => {
        const x = e.absoluteX - offset.current.x;
        const y = e.absoluteY - offset.current.y;
        tx.value = x;
        ty.value = y;

        const photoH = height - HEADER_HEIGHT - BOTTOM_CONTROLS_HEIGHT;
        const tX = width / 2 - TRASH_ZONE.w / 2;
        const tY = photoH - TRASH_ZONE.h;
        const hovering = x >= tX && x <= tX + TRASH_ZONE.w && y >= tY && y <= tY + TRASH_ZONE.h;

        if (hovering) {
          runOnJS(removeSticker)(sticker.id);
        }
        runOnJS(setOverTrashGlobal)(hovering);
      })
      .onEnd((e) => {
        const stillExists = stickers.find((s) => s.id === sticker.id);
        if (!stillExists) return;

        const photoH = height - HEADER_HEIGHT - BOTTOM_CONTROLS_HEIGHT;
        const finalX = e.absoluteX - offset.current.x;
        const finalY = e.absoluteY - offset.current.y;
        const x = Math.max(0, Math.min(width - 60, finalX));
        const y = Math.max(0, Math.min(photoH - 60, finalY));

        tx.value = x;
        ty.value = y;
        runOnJS(updateStickerPosition)(sticker.id, x, y);
        sc.value = withSpring(sticker.scale);
        runOnJS(setOverTrashGlobal)(false);
      });

    const pinch = Gesture.Pinch()
      .onUpdate((e) => {
        sc.value = clamp(sticker.scale * e.scale, 0.3, 3);
      })
      .onEnd(() => {
        runOnJS(updateStickerScale)(sticker.id, sc.value);
      });

    const gesture = Gesture.Simultaneous(pan, pinch);
    const style = useAnimatedStyle(() => ({
      transform: [{ translateX: tx.value }, { translateY: ty.value }, { scale: sc.value }],
    }));

    return (
      <GestureDetector gesture={gesture}>
        <Animated.View
          style={[
            {
              position: "absolute",
              width: 60,
              height: 60,
              justifyContent: "center",
              alignItems: "center",
            },
            style,
          ]}
        >
          <Text style={{ fontSize: 19 }}>{sticker.emoji}</Text>
        </Animated.View>
      </GestureDetector>
    );
  };

  const navigateToContacts = async () => {
    console.log("Navigate to Contacts button pressed!");
    try {
      const flattenedUri = await captureRef(photoCanvasRef, {
        format: "png",
        quality: 1,
      });

      router.push({
        pathname: "/select-contacts",
        params: { imageUri: flattenedUri },
      });
    } catch (error) {
      console.warn("Could not capture image", error);
    }
  };

  if (!imageUri) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-black">
        <Text className="text-typography-white mb-4 text-lg">No image found</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Box className="px-6 py-3 bg-blue-500 rounded-full">
            <Text className="text-white">Go Back</Text>
          </Box>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-black">
      <StatusBar style="light" />
      <Box className="flex-1">
        <Box className="absolute top-0 left-0 right-0 z-10">
          <Box className="flex-row justify-between items-center p-4">
            <TouchableOpacity onPress={() => router.back()}>
              <Box className="w-10 h-10 bg-black/50 rounded-full items-center justify-center">
                <Text className="text-white text-xl">←</Text>
              </Box>
            </TouchableOpacity>

            <Text className="text-white font-bold text-lg">Edit Photo</Text>

            <TouchableOpacity
              onPress={() => setStickers([])}
              style={{ width: 40, alignItems: "center" }}
              disabled={stickers.length === 0}
            >
              <Text className="text-red-400 text-sm font-medium">{stickers.length ? "Clear" : ""}</Text>
            </TouchableOpacity>
          </Box>
        </Box>

        <Box className="flex-1 relative" ref={photoCanvasRef} renderToHardwareTextureAndroid={true}>
          <Image source={{ uri: imageUri }} style={{ width: "100%", height: "100%", resizeMode: "cover" }} />

          {stickers.map((s) => (
            <StickerItem key={s.id} sticker={s} />
          ))}
        </Box>

        {stickers.length > 0 && (
          <Box
            className="absolute rounded-full items-center justify-center border-2 bg-red-500/40 border-red-500"
            style={{
              width: TRASH_SIZE,
              height: TRASH_SIZE,
              bottom: BOTTOM_CONTROLS_HEIGHT + 30,
              left: width / 2 - TRASH_SIZE / 2,
              transform: [{ scale: overTrashGlobal ? 1.05 : 1 }],
            }}
          >
            <Text className="text-white text-2xl">🗑️</Text>
          </Box>
        )}

        <TouchableOpacity
          onPress={navigateToContacts}
          activeOpacity={0.8}
          style={{
            position: "absolute",
            bottom: BOTTOM_CONTROLS_HEIGHT + 20,
            right: 20,
            zIndex: 10,
          }}
        >
          <Box className="w-14 h-14 bg-blue-500 rounded-full items-center justify-center shadow-lg border-2 border-blue-400">
            <Ionicons name="arrow-forward" size={24} color="white" />
          </Box>
        </TouchableOpacity>

        <Box style={{ height: BOTTOM_CONTROLS_HEIGHT }} className="bg-black">
          <Box className="px-4 py-2">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <Box className="flex-row gap-2">
                {Object.keys(emojiCategories).map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setCategory(cat as CategoryKey)}
                    className={
                      category === cat
                        ? "px-4 py-2 rounded-full bg-blue-500"
                        : "px-4 py-2 rounded-full bg-background-700"
                    }
                  >
                    <Text
                      className={
                        category === cat
                          ? "text-white text-sm font-medium capitalize"
                          : "text-typography-400 text-sm font-medium capitalize"
                      }
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </Box>
            </ScrollView>
          </Box>

          <Box className="bg-background-800 p-4 flex-1">
            <Text className="text-white font-medium mb-3">
              Add {category.charAt(0).toUpperCase() + category.slice(1)} Stickers
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <Box className="flex-row gap-3">
                {emojiCategories[category].map((emoji, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => addSticker(emoji)}
                    activeOpacity={0.7}
                    className="w-12 h-12 bg-background-700 rounded-full items-center justify-center border border-outline-600"
                  >
                    <Text style={{ fontSize: 19 }}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </Box>
            </ScrollView>
            <Text className="text-typography-400 text-xs mt-2 text-center">
              Tap to add • Pinch to resize • Drag to move • Drag to trash to remove
            </Text>
          </Box>
        </Box>
      </Box>
    </SafeAreaView>
  );
}
