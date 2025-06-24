import React, { useState } from "react";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { TouchableOpacity, Image, Dimensions, ScrollView, Alert, View } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { PanGestureHandler, State } from "react-native-gesture-handler";
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  runOnJS,
  withSpring,
} from "react-native-reanimated";
import { useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

// Enhanced emoji stickers with categories
const emojiCategories = {
  faces: ["😀", "😍", "🥰", "😎", "🤔", "😴", "🤪", "🙃"],
  reactions: ["🔥", "💯", "👍", "👎", "💪", "🙌", "👏", "✌️"],
  hearts: ["❤️", "💕", "💖", "💗", "💙", "💚", "💛", "🧡"],
  fun: ["🎉", "✨", "🌟", "⚡", "💥", "🎊", "🎈", "🎁"],
  nature: ["🌈", "☀️", "🌙", "⭐", "🌸", "🌺", "🦋", "🐝"],
};

interface StickerPosition {
  id: string;
  emoji: string;
  x: number;
  y: number;
  scale: number;
}

const HEADER_HEIGHT = 100;
const BOTTOM_CONTROLS_HEIGHT = 200;
const TRASH_SIZE = 60;
const TRASH_ZONE_SIZE = 100;

export default function PhotoEditorScreen() {
  const { imageUri } = useLocalSearchParams();
  const [placedStickers, setPlacedStickers] = useState<StickerPosition[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof emojiCategories>("faces");
  const [isDragging, setIsDragging] = useState(false);

  const addSticker = (emoji: string) => {
    const photoAreaHeight = height - HEADER_HEIGHT - BOTTOM_CONTROLS_HEIGHT;
    const newSticker: StickerPosition = {
      id: Date.now().toString(),
      emoji,
      x: Math.random() * (width - 60),
      y: Math.random() * (photoAreaHeight - 60) + 20,
      scale: 0.8 + Math.random() * 0.4,
    };
    setPlacedStickers((prev) => [...prev, newSticker]);
  };

  const removeSticker = (id: string) => {
    setPlacedStickers((prev) => prev.filter((sticker) => sticker.id !== id));
  };

  const clearAllStickers = () => {
    if (placedStickers.length === 0) return;

    Alert.alert("Clear All Stickers", "Remove all stickers from the photo?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear All",
        style: "destructive",
        onPress: () => setPlacedStickers([]),
      },
    ]);
  };

  const handleSendPhoto = () => {
    if (placedStickers.length === 0) {
      Alert.alert("No Stickers Added", "Would you like to send the photo without stickers?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Send Anyway",
          onPress: () => navigateToContacts(),
        },
      ]);
      return;
    }
    navigateToContacts();
  };

  const navigateToContacts = () => {
    router.push({
      pathname: "/select-contacts",
      params: {
        imageUri: imageUri as string,
        stickers: JSON.stringify(placedStickers),
      },
    });
  };

  const DraggableSticker = ({ sticker }: { sticker: StickerPosition }) => {
    const translateX = useSharedValue(sticker.x);
    const translateY = useSharedValue(sticker.y);
    const scale = useSharedValue(sticker.scale);

    // Only update initial position when the sticker is first created
    // Don't reset on every render
    useEffect(() => {
      // Only update if the values are different (new sticker)
      if (translateX.value !== sticker.x || translateY.value !== sticker.y) {
        translateX.value = sticker.x;
        translateY.value = sticker.y;
        scale.value = sticker.scale;
      }
    }, [sticker.id]); // Only depend on sticker ID, not position

    const gestureHandler = useAnimatedGestureHandler({
      onStart: () => {
        runOnJS(setIsDragging)(true);
        scale.value = withSpring(sticker.scale * 1.2);
      },
      onActive: (event) => {
        translateX.value = event.absoluteX - 30;
        translateY.value = event.absoluteY - HEADER_HEIGHT - 30;
      },
      onEnd: (event) => {
        const photoAreaHeight = height - HEADER_HEIGHT - BOTTOM_CONTROLS_HEIGHT;
        const finalX = event.absoluteX - 30;
        const finalY = event.absoluteY - HEADER_HEIGHT - 30;

        // Check if dropped in trash zone (bottom center)
        const trashZoneX = width / 2 - TRASH_ZONE_SIZE / 2;
        const trashZoneY = photoAreaHeight - TRASH_ZONE_SIZE;

        if (
          finalX >= trashZoneX &&
          finalX <= trashZoneX + TRASH_ZONE_SIZE &&
          finalY >= trashZoneY &&
          finalY <= trashZoneY + TRASH_ZONE_SIZE
        ) {
          // Remove the sticker
          runOnJS(removeSticker)(sticker.id);
        } else {
          // Update sticker position in state
          const constrainedX = Math.max(0, Math.min(width - 60, finalX));
          const constrainedY = Math.max(0, Math.min(photoAreaHeight - 60, finalY));

          // Update the animated values to the final position
          translateX.value = constrainedX;
          translateY.value = constrainedY;

          // Update the state
          runOnJS(setPlacedStickers)((prev) =>
            prev.map((s) => (s.id === sticker.id ? { ...s, x: constrainedX, y: constrainedY } : s))
          );
        }

        scale.value = withSpring(sticker.scale);
        runOnJS(setIsDragging)(false);
      },
    });

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ translateX: translateX.value }, { translateY: translateY.value }, { scale: scale.value }],
    }));

    return (
      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View
          style={[
            {
              position: "absolute",
              zIndex: 10,
            },
            animatedStyle,
          ]}
        >
          <Text style={{ fontSize: 32 }}>{sticker.emoji}</Text>
        </Animated.View>
      </PanGestureHandler>
    );
  };

  if (!imageUri) {
    return (
      <SafeAreaView className="flex-1 bg-black">
        <Box className="flex-1 justify-center items-center p-4">
          <Text className="text-typography-white text-center text-lg">No image found</Text>
          <TouchableOpacity onPress={() => router.back()} className="mt-4 px-6 py-3 bg-blue-500 rounded-full">
            <Text className="text-white font-medium">Go Back</Text>
          </TouchableOpacity>
        </Box>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-black">
      <Box className="flex-1">
        {/* Header */}
        <Box
          className="flex-row justify-between items-center p-4 border-b border-outline-700"
          style={{ height: HEADER_HEIGHT }}
        >
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white font-bold text-lg">Edit Photo</Text>
          <TouchableOpacity onPress={clearAllStickers}>
            <Text className="text-red-400 text-sm font-medium">{placedStickers.length > 0 ? "Clear" : ""}</Text>
          </TouchableOpacity>
        </Box>

        {/* Photo Area - Full screen coverage */}
        <Box className="flex-1 relative">
          <Image
            source={{ uri: imageUri as string }}
            style={{
              width: "100%",
              height: "100%",
              resizeMode: "cover",
            }}
          />

          {/* Sticker count indicator */}
          {placedStickers.length > 0 && (
            <Box className="absolute top-4 left-4 px-3 py-1 bg-black/70 rounded-full">
              <Text className="text-white text-sm font-medium">
                {placedStickers.length} sticker{placedStickers.length !== 1 ? "s" : ""}
              </Text>
            </Box>
          )}

          {/* Draggable stickers */}
          {placedStickers.map((sticker) => (
            <DraggableSticker key={sticker.id} sticker={sticker} />
          ))}

          {/* Trash bin - always visible when there are stickers, highlighted when dragging */}
          {placedStickers.length > 0 && (
            <Box
              className={`absolute rounded-full items-center justify-center border-2 ${
                isDragging ? "bg-red-500/90 border-red-400 shadow-lg scale-110" : "bg-red-500/40 border-red-500"
              }`}
              style={{
                width: TRASH_SIZE,
                height: TRASH_SIZE,
                bottom: 30,
                left: width / 2 - TRASH_SIZE / 2,
              }}
            >
              <Text className="text-white text-2xl">🗑️</Text>
            </Box>
          )}

          {/* Send button */}
          <Box className="absolute bottom-6 right-6">
            <TouchableOpacity onPress={handleSendPhoto} activeOpacity={0.8}>
              <Box className="w-14 h-14 bg-blue-500 rounded-full items-center justify-center shadow-lg border-2 border-blue-400">
                <Ionicons name="arrow-forward" size={24} color="white" />
              </Box>
            </TouchableOpacity>
          </Box>
        </Box>

        {/* Bottom Controls */}
        <Box style={{ height: BOTTOM_CONTROLS_HEIGHT }} className="bg-black">
          {/* Sticker categories */}
          <Box className="px-4 py-2">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <Box className="flex-row gap-2">
                {Object.keys(emojiCategories).map((category) => (
                  <TouchableOpacity
                    key={category}
                    onPress={() => setSelectedCategory(category as keyof typeof emojiCategories)}
                    className={`px-4 py-2 rounded-full ${
                      selectedCategory === category ? "bg-blue-500" : "bg-background-700"
                    }`}
                  >
                    <Text
                      className={`text-sm font-medium capitalize ${
                        selectedCategory === category ? "text-white" : "text-typography-400"
                      }`}
                    >
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </Box>
            </ScrollView>
          </Box>

          {/* Sticker selection */}
          <Box className="bg-background-800 p-4 flex-1">
            <Text className="text-white font-medium mb-3">
              Add {selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Stickers
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <Box className="flex-row gap-3">
                {emojiCategories[selectedCategory].map((emoji, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => addSticker(emoji)}
                    className="w-12 h-12 bg-background-700 rounded-full items-center justify-center border border-outline-600"
                    activeOpacity={0.7}
                  >
                    <Text style={{ fontSize: 24 }}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </Box>
            </ScrollView>

            {/* Instructions */}
            <Text className="text-typography-400 text-xs mt-2 text-center">
              Tap to add • Long press and drag to move • Drag to trash to remove
            </Text>
          </Box>
        </Box>
      </Box>
    </SafeAreaView>
  );
}
