import React, { useState } from "react";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { TouchableOpacity, ScrollView, Alert } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

interface StickerPack {
  id: string;
  name: string;
  description: string;
  price: string;
  emoji: string;
  stickers: string[];
  category: string;
}

const stickerPacks: StickerPack[] = [
  {
    id: "1",
    name: "Animal Friends",
    description: "Cute animal stickers for your photos",
    price: "0,99€",
    emoji: "🐶",
    stickers: ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼"],
    category: "Animals",
  },
  {
    id: "2",
    name: "Food & Drinks",
    description: "Delicious food and drink stickers",
    price: "1,99€",
    emoji: "🍕",
    stickers: ["🍕", "🍔", "🍟", "🌭", "🍿", "🧁", "🍩", "☕"],
    category: "Food",
  },
  {
    id: "3",
    name: "Party Time",
    description: "Celebrate with party stickers",
    price: "2,99€",
    emoji: "🎉",
    stickers: ["🎉", "🎊", "🎈", "🎁", "🎂", "🎄", "🎃", "🎆"],
    category: "Party",
  },
  {
    id: "4",
    name: "Love & Hearts",
    description: "Express your love with heart stickers",
    price: "1,49€",
    emoji: "💕",
    stickers: ["💕", "💖", "💗", "💙", "💚", "💛", "🧡", "💜"],
    category: "Love",
  },
  {
    id: "5",
    name: "Travel & Adventure",
    description: "Show your wanderlust with travel stickers",
    price: "3,99€",
    emoji: "✈️",
    stickers: ["✈️", "🏖️", "🏔️", "🗺️", "🧳", "📸", "🎒", "🌍"],
    category: "Travel",
  },
  {
    id: "6",
    name: "Zodiac Signs",
    description: "Astrological signs and symbols",
    price: "2,49€",
    emoji: "♈",
    stickers: ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏"],
    category: "Astrology",
  },
  {
    id: "7",
    name: "Sports & Fitness",
    description: "Get active with sports stickers",
    price: "1,99€",
    emoji: "⚽",
    stickers: ["⚽", "🏀", "🏈", "⚾", "🎾", "🏐", "🏓", "🏸"],
    category: "Sports",
  },
  {
    id: "8",
    name: "Premium Bundle",
    description: "All sticker packs included",
    price: "9,99€",
    emoji: "💎",
    stickers: ["💎", "⭐", "🔥", "💯", "✨", "🌟", "💫", "🏆"],
    category: "Premium",
  },
];

const StickerPackCard = ({ pack, onPurchase }: { pack: StickerPack; onPurchase: (pack: StickerPack) => void }) => {
  return (
    <Box className="bg-background-800 rounded-xl p-4 mb-4 border border-outline-700">
      {/* Header */}
      <Box className="flex-row items-center justify-between mb-3">
        <Box className="flex-row items-center">
          <Text className="text-4xl mr-3">{pack.emoji}</Text>
          <Box>
            <Text className="text-typography-white font-bold text-lg">{pack.name}</Text>
            <Text className="text-typography-400 text-sm">{pack.category}</Text>
          </Box>
        </Box>
        <Box className="bg-blue-500 px-3 py-1 rounded-full">
          <Text className="text-white font-bold text-lg">{pack.price}</Text>
        </Box>
      </Box>

      {/* Description */}
      <Text className="text-typography-400 text-base mb-3">{pack.description}</Text>

      {/* Sticker Preview */}
      <Box className="flex-row flex-wrap mb-4">
        {pack.stickers.slice(0, 6).map((sticker, index) => (
          <Text key={index} className="text-2xl mr-2 mb-1">
            {sticker}
          </Text>
        ))}
        {pack.stickers.length > 6 && (
          <Text className="text-typography-400 text-base">+{pack.stickers.length - 6} more</Text>
        )}
      </Box>

      {/* Purchase Button */}
      <TouchableOpacity onPress={() => onPurchase(pack)} activeOpacity={0.8}>
        <Box className="bg-blue-500 rounded-lg py-3 items-center">
          <Text className="text-white font-bold text-base">Purchase {pack.price}</Text>
        </Box>
      </TouchableOpacity>
    </Box>
  );
};

export default function ShopScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const categories = ["All", ...Array.from(new Set(stickerPacks.map((pack) => pack.category)))];

  const filteredPacks =
    selectedCategory === "All" ? stickerPacks : stickerPacks.filter((pack) => pack.category === selectedCategory);

  const handlePurchase = (pack: StickerPack) => {
    Alert.alert("Purchase Sticker Pack", `Do you want to purchase "${pack.name}" for ${pack.price}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Purchase",
        onPress: () => {
          Alert.alert("Purchase Successful!", `You now have access to "${pack.name}" stickers!`);
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <Box className="flex-1">
        {/* Header */}
        <Box className="flex-row justify-between items-center p-4 border-b border-outline-700">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white font-bold text-lg">Sticker Shop</Text>
          <Box className="w-6" />
        </Box>

        {/* Category Filter */}
        <Box className="px-4 py-3">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <Box className="flex-row gap-2">
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  onPress={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full ${
                    selectedCategory === category ? "bg-blue-500" : "bg-background-700"
                  }`}
                >
                  <Text
                    className={`text-sm font-medium ${
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

        {/* Shop Header */}
        <Box className="px-4 py-2">
          <Text className="text-typography-white text-2xl font-bold">Premium Stickers</Text>
          <Text className="text-typography-400 text-base">Enhance your photos with exclusive sticker packs</Text>
        </Box>

        {/* Sticker Packs */}
        <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
          {filteredPacks.map((pack) => (
            <StickerPackCard key={pack.id} pack={pack} onPurchase={handlePurchase} />
          ))}

          {/* Footer */}
          <Box className="py-8 items-center">
            <Text className="text-typography-400 text-sm text-center">
              All purchases are processed securely.{"\n"}
              Stickers will be available immediately after purchase.
            </Text>
          </Box>
        </ScrollView>
      </Box>
    </SafeAreaView>
  );
}
