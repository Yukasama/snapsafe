import React, { useState } from "react";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { TouchableOpacity, TextInput, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useUser } from "@/context/UserContext";
import { StatusBar } from "expo-status-bar";

export default function SettingsScreen() {
  const router = useRouter();
  const { username, displayName, signOut } = useUser();
  const [themeMode, setThemeMode] = useState<"light" | "dark" | "system">("system");

  const handleSignOut = async () => {
    signOut();
  };

  const ThemeOption = ({ mode, label }: { mode: "light" | "dark" | "system"; label: string }) => (
    <TouchableOpacity onPress={() => setThemeMode(mode)} className="mb-3">
      <Box className="flex-row items-center justify-between p-4 bg-zinc-800 rounded-lg">
        <Text className="text-typography-white text-lg">{label}</Text>
        <Box
          className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
            themeMode === mode ? "bg-blue-500 border-blue-500" : "border-typography-400"
          }`}
        >
          {themeMode === mode && <Text className="text-white text-xs font-bold">✓</Text>}
        </Box>
      </Box>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-black">
      <StatusBar style="light" />
      <Box className="flex-1">
        <Box className="flex-row justify-between items-center p-4 border-b border-outline-700">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white font-bold text-lg">Account Settings</Text>
          <Box className="w-6" />
        </Box>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <Box className="p-4">
            <Box className="mb-8">
              <Text className="text-typography-white font-bold text-xl mb-4">Profile</Text>
              <Box className="items-center mb-6">
                <Box className="w-24 h-24 rounded-full bg-blue-500 items-center justify-center mb-3">
                  <Text className="text-white text-3xl font-bold">
                    {(displayName || "A")
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </Text>
                </Box>
                <TouchableOpacity>
                  <Text className="text-blue-500 text-base">Change Profile Picture</Text>
                </TouchableOpacity>
              </Box>

              <Box className="mb-6">
                <Text className="text-typography-white font-medium text-lg mb-2">Name</Text>
                <Box className="bg-zinc-800 rounded-lg p-4 flex-row items-center">
                  <Text className="text-typography-400 text-base">{displayName || ""}</Text>
                </Box>
                <Text className="text-typography-400 text-sm mt-1">Name cannot be changed.</Text>
              </Box>

              <Box className="mb-6">
                <Text className="text-typography-white font-medium text-lg mb-2">Phone Number</Text>
                <Box className="bg-zinc-800 rounded-lg p-4">
                  <Text className="text-typography-400 text-base">{username}</Text>
                </Box>
                <Text className="text-typography-400 text-sm mt-1">Phone number cannot be changed</Text>
              </Box>
            </Box>

            <Box className="mb-8">
              <Text className="text-typography-white font-bold text-xl mb-4">Appearance</Text>
              <ThemeOption mode="light" label="Light Mode" />
              <ThemeOption mode="dark" label="Dark Mode" />
              <ThemeOption mode="system" label="System (Auto)" />
            </Box>

            <Box>
              <Text className="text-typography-white font-bold text-xl mb-4">Other</Text>

              <TouchableOpacity className="mb-3">
                <Box className="p-4 bg-zinc-800 rounded-lg flex-row items-center">
                  <MaterialIcons name="security" size={24} color="#9CA3AF" />
                  <Text className="text-typography-white text-lg ml-3">Privacy & Security</Text>
                </Box>
              </TouchableOpacity>

              <TouchableOpacity className="mb-3">
                <Box className="p-4 bg-zinc-800 rounded-lg flex-row items-center">
                  <Ionicons name="notifications-outline" size={24} color="#9CA3AF" />
                  <Text className="text-typography-white text-lg ml-3">Notifications</Text>
                </Box>
              </TouchableOpacity>

              <TouchableOpacity className="mb-3">
                <Box className="p-4 bg-zinc-800 rounded-lg flex-row items-center">
                  <MaterialIcons name="storage" size={24} color="#9CA3AF" />
                  <Text className="text-typography-white text-lg ml-3">Storage & Data</Text>
                </Box>
              </TouchableOpacity>
              {}
              <TouchableOpacity onPress={handleSignOut} className="mb-3">
                <Box className="p-4 bg-red-500/20 rounded-lg border border-red-500/30 flex-row items-center">
                  <MaterialIcons name="logout" size={24} color="#F87171" />
                  <Text className="text-red-400 text-lg ml-3">Sign Out</Text>
                </Box>
              </TouchableOpacity>
            </Box>
          </Box>
        </ScrollView>
      </Box>
    </SafeAreaView>
  );
}
