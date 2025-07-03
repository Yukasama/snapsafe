import { Stack } from "expo-router";

export default function LoginLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
      <Stack.Screen name="index" options={{ gestureEnabled: false }} />
      <Stack.Screen name="verify" options={{ gestureEnabled: false }} />
      <Stack.Screen name="setDisplayname" options={{ gestureEnabled: false }} />
    </Stack>
  );
}