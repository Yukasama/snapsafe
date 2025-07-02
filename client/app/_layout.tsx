import 'react-native-get-random-values';
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import { useColorScheme } from "@/components/useColorScheme";
import { Stack } from "expo-router";
import "../global.css";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { initCrypto } from "@/crypto/initCrypto";
import { ChatProvider } from '@/context/ChatContext';
import { UserProvider, useUser } from "@/context/UserContext";
import { ActivityIndicator, TextInput, TouchableOpacity, View, Alert } from 'react-native';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { SafeAreaView } from 'react-native-safe-area-context';

export { ErrorBoundary } from "expo-router";

SplashScreen.preventAutoHideAsync();

// asks for the user's phone number
function AskForUsername() {
  const { signIn } = useUser();
  const [phoneNumber, setPhoneNumber] = useState("");

  const handleContinue = async () => {
    if (phoneNumber.trim().length < 2) {
      Alert.alert("Invalid Phone Number", "Please enter a valid phone number.");
      return;
    }
    await signIn(phoneNumber.trim());
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'black' }}>
      <View style={{ flex: 1, justifyContent: 'center', padding: 32 }}>
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
          onPress={handleContinue}
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


function AppInitializer() {
  const { username } = useUser();
  const [isAppReady, setAppReady] = useState(false);
  const colorScheme = useColorScheme();

  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  // Hide splash screen only when fonts are loaded and app is ready to show something
  useEffect(() => {
    if (loaded && (isAppReady || !username)) {
      SplashScreen.hideAsync();
    }
  }, [loaded, isAppReady, username]);

  useEffect(() => {
    if (username) {
      initCrypto(username)
        .then(() => setAppReady(true))
        .catch((err) => {
          console.error("Fatal crypto init error:", err);
          Alert.alert("Initialization Failed", "Could not initialize the app. Please restart.");
        });
    }
  }, [username]);

  if (!loaded) return null;

  if (!username) {
    return <AskForUsername />;
  }

  if (!isAppReady) {
    return (
       <Box className="flex-1 items-center justify-center bg-black">
        <ActivityIndicator size="large" color="#ffffff" />
        <Text className="text-white mt-4">Initializing...</Text>
      </Box>
    );
  }

  return (
    <ChatProvider>
      <GestureHandlerRootView className="flex-1">
        <GluestackUIProvider mode={colorScheme === "dark" ? "dark" : "light"}>
          <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
            <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="camera/index" />
              <Stack.Screen name="edit-photo/index" />
              <Stack.Screen name="select-contacts/index" />
              <Stack.Screen name="chat/[id]" />
              <Stack.Screen name="settings/index" options={{ animation: "slide_from_bottom" }} />
              <Stack.Screen name="shop/index" />
              <Stack.Screen name="+not-found" />
            </Stack>
          </ThemeProvider>
        </GluestackUIProvider>
      </GestureHandlerRootView>
    </ChatProvider>
  );
}

function RootLayout() {
  const { isLoading } = useUser();

  // Show splash screen while we are checking for a user in storage
  if (isLoading) {
    return null;
  }

  return <AppInitializer />;
}

export default function RootLayoutWrapper() {
  return (
    <UserProvider>
      <RootLayout />
    </UserProvider>
  )
}