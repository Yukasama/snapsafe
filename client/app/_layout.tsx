import 'react-native-get-random-values';
import React, { useEffect, useState } from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import { useColorScheme } from "@/components/useColorScheme";
import { Stack, useRouter, useSegments } from "expo-router";
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

const AppLayout = () => {
  const { username, isLoading } = useUser();
  const [isCryptoReady, setCryptoReady] = useState(false);
  const router = useRouter();
  const segments = useSegments();

  const [fontsLoaded, fontError] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  useEffect(() => {
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
    if (fontError) throw fontError;
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    if (isLoading || !fontsLoaded) return;

    const inAuthGroup = segments[0] === 'login';

    if (!username && !inAuthGroup) {
      // If user is not signed in and not in auth group, redirect to login.
      router.replace('/login');
    } else if (username && isCryptoReady && inAuthGroup) {
      // If user is signed in, crypto is ready, and they are in the auth group,
      // redirect them to the main app.
      router.replace('/');
    }
  }, [username, segments, isLoading, fontsLoaded, isCryptoReady, router]);

  return (
      <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
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
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <UserProvider>
      <ChatProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <GluestackUIProvider mode={colorScheme === "dark" ? "dark" : "light"}>
            <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
              <AppLayout />
            </ThemeProvider>
          </GluestackUIProvider>
        </GestureHandlerRootView>
      </ChatProvider>
    </UserProvider>
  );
}
