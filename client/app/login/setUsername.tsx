import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "@/components/ui/text";
import { Box } from "@/components/ui/box";
import { useUser } from "@/context/UserContext";
import { StatusBar } from "expo-status-bar";

export default function SetUsernameScreen() {
  const { signIn } = useUser();
  const [username, setUsername] = useState("");

  const handleContinue = async () => {
    const trimmedUsername = username.trim();
    if (trimmedUsername.length < 3) {
      Alert.alert(
        "Invalid Username",
        "Your username must be at least 3 characters long."
      );
      return;
    }
    await signIn(trimmedUsername);
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <StatusBar style="light" />
      <View className="flex-1 justify-center p-8">
        <Text className="text-white text-3xl font-bold text-center mb-8">
          Choose a Username
        </Text>
        <Box className="bg-gray-800 rounded-lg p-4 mb-6">
          <TextInput
            className="text-white text-lg text-center"
            placeholder="e.g., SnapMaster"
            placeholderTextColor="#666666"
            value={username}
            onChangeText={setUsername}
            autoFocus={true}
            onSubmitEditing={handleContinue}
          />
        </Box>
        <TouchableOpacity
          onPress={handleContinue}
          className="bg-blue-600 p-4 rounded-lg"
          disabled={username.trim().length < 3}
          style={{ opacity: username.trim().length < 3 ? 0.5 : 1 }}
        >
          <Text className="text-white text-center text-lg font-bold">
            Continue
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
