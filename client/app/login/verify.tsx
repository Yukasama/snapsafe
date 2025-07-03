import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "@/components/ui/text";
import { Box } from "@/components/ui/box";
// highlight-next-line
import { useLocalSearchParams, useRouter } from "expo-router"; // Import useRouter
import { StatusBar } from "expo-status-bar";

export default function VerificationScreen() {
  // We don't need the signIn function here anymore.
  // highlight-next-line
  const router = useRouter();
  const [code, setCode] = useState("");
  
  const { phoneNumber } = useLocalSearchParams<{ phoneNumber: string }>();

  const handleVerification = async () => {
    if (code === "0000") {
      // On successful verification, navigate to the set username screen.
      // highlight-next-line
      router.push("/login/setUsername");
    } else {
      Alert.alert("Invalid Code", "The code you entered is incorrect. Please try again.");
      setCode("");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <StatusBar style="light" />
      <View className="flex-1 justify-center p-8">
        <Text className="text-white text-3xl font-bold text-center mb-4">
          Enter Code
        </Text>
        <Text className="text-gray-400 text-md text-center mb-8">
          We sent a verification code to{"\n"}
          {phoneNumber}
        </Text>
        <Box className="bg-gray-800 rounded-lg p-4 mb-6">
          <TextInput
            className="text-white text-2xl text-center tracking-widest"
            placeholder="----"
            placeholderTextColor="#666666"
            keyboardType="number-pad"
            value={code}
            onChangeText={setCode}
            maxLength={4}
            autoFocus={true}
          />
        </Box>
        <TouchableOpacity
          onPress={handleVerification}
          className="bg-blue-600 p-4 rounded-lg"
          disabled={code.length !== 4}
          style={{ opacity: code.length !== 4 ? 0.5 : 1 }}
        >
          <Text className="text-white text-center text-lg font-bold">
            Verify
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
