import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "@/components/ui/text";
import { Box } from "@/components/ui/box";
import { useUser } from "@/context/UserContext";

export default function LoginScreen() {
  const { signIn } = useUser();
  const [phoneNumber, setPhoneNumber] = useState("");

  const handleLogin = async () => {
    if (phoneNumber.trim().length < 5) {
      Alert.alert("Invalid Phone Number", "Please enter a valid phone number.");
      return;
    }
    // This will save the username AND update the app's state
    await signIn(phoneNumber.trim());
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <View className="flex-1 justify-center p-8">
        <Text className="text-white text-3xl font-bold text-center mb-8">
          Enter Your Phone Number
        </Text>
        <Box className="bg-background-800 rounded-lg p-4 mb-6">
          <TextInput
            className="text-white text-lg text-center"
            placeholder="e.g., +49 151 123456"
            placeholderTextColor="#666666"
            keyboardType="phone-pad"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
          />
        </Box>
        <TouchableOpacity
          onPress={handleLogin}
          className="bg-blue-600 p-4 rounded-lg"
        >
          <Text className="text-white text-center text-lg font-bold">
            Continue
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}