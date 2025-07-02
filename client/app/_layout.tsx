import 'react-native-get-random-values';
import React, { useEffect, useState } from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import { useColorScheme } from "@/components/useColorScheme";
import { Stack, useRouter } from "expo-router"; // Removed useSegments as it's not needed here
import "../global.css";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { initCrypto } from "@/crypto/initCrypto";
import { ChatProvider } from '@/context/ChatContext';
import { UserProvider, useUser } from "@/context/UserContext";
import { ActivityIndicator, Alert } from 'react-native';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';

export { ErrorBoundary } from "expo-router";

SplashScreen.preventAutoHideAsync();

function InitialLayout() {
  const { username, isLoading } = useUser();
  const [isCryptoReady, setCryptoReady] = useState(false);
  const router = useRouter();
  const colorScheme = useColorScheme();

  const [fontsLoaded, fontError] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (fontError) throw fontError;
  }, [fontError]);

  useEffect(() => {
    // Initialize crypto when the user is logged in.
    if (username && !isCryptoReady) {
      initCrypto(username)
        .then(() => setCryptoReady(true))
        .catch((err) => {
          console.error("Fatal crypto init error:", err);
          Alert.alert("Initialization Failed", "Could not initialize app.");
        });
    }
  }, [username, isCryptoReady]);
  
  useEffect(() => {
    if (isLoading || !fontsLoaded) return; // Wait until user and fonts are loaded

    SplashScreen.hideAsync();

    if (!username) {
      // If the user is not signed in, replace the current history with the login page.
      router.replace('/login');
    } else if (username && isCryptoReady) {
      // If the user is signed in and crypto is ready, replace with the main app screen.
      router.replace('/');
    }
    // If user exists but crypto isn't ready, the loading screen will show, no redirect needed yet.

  }, [isLoading, fontsLoaded, username, isCryptoReady, router]);

  // Show a loading indicator while checking auth state or initializing.
  if (isLoading || !fontsLoaded || (username && !isCryptoReady)) {
    return (
      <Box className="flex-1 items-center justify-center bg-black">
        <ActivityIndicator size="large" color="#ffffff" />
        <Text className="text-white mt-4">{!fontsLoaded ? "Loading fonts..." : "Initializing..."}</Text>
      </Box>
    );
  }
  
  // Render the main app navigator. It's always rendered, which fixes the original error.
  return (
    <ChatProvider>
      <GestureHandlerRootView className="flex-1">
        <GluestackUIProvider mode={colorScheme === "dark" ? "dark" : "light"}>
          <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
            <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
              {/* Define all your screens here so the router knows about them */}
              <Stack.Screen name="login/index" options={{ gestureEnabled: false }} />
              <Stack.Screen name="index" />
              <Stack.Screen name="view-photo/index" />
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

// Default export wraps the main layout with the UserProvider
export default function RootLayout() {
  return (
    <UserProvider>
      <InitialLayout />
    </UserProvider>
  );
}