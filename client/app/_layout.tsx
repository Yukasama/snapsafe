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

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

// export const unstable_settings = {
//   // Ensure that reloading on `/modal` keeps a back button present.
//   initialRouteName: "gluestack",
// };

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    initCrypto().then(() => setReady(true)).catch(console.error);
  }, []);

  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  const [styleLoaded, setStyleLoaded] = useState(false);
  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!ready) return null; // or splash/loading

  // useLayoutEffect(() => {
  //   setStyleLoaded(true);
  // }, [styleLoaded]);

  // if (!loaded || !styleLoaded) {
  //   return null;
  // }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <ChatProvider>
      <GestureHandlerRootView className="flex-1">
        <GluestackUIProvider mode={colorScheme === "dark" ? "dark" : "light"}>
          <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
            <Stack
              screenOptions={{
                headerShown: false,
                animation: "slide_from_right",
                gestureEnabled: true,
                gestureDirection: "horizontal",
              }}
            >
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="camera/index" options={{ headerShown: false, animation: "slide_from_right" }} />
              <Stack.Screen name="edit-photo/index" options={{ headerShown: false, animation: "slide_from_right" }} />
              <Stack.Screen name="select-contacts/index" options={{ headerShown: false, animation: "slide_from_right" }} />
              <Stack.Screen name="chat/[id]" options={{ headerShown: false, animation: "slide_from_right" }} />
              <Stack.Screen name="settings/index" options={{ headerShown: false, animation: "slide_from_bottom" }} />
              <Stack.Screen name="shop/index" options={{ headerShown: false, animation: "slide_from_right" }} />
              <Stack.Screen name="+not-found" />
            </Stack>
          </ThemeProvider>
        </GluestackUIProvider>
      </GestureHandlerRootView>
    </ChatProvider>
  );
}
