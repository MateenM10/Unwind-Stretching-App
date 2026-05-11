import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="session" options={{ headerShown: false }} />
      <Stack.Screen name="bodypart" options={{ headerShown: false }} />
      <Stack.Screen name="complete" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="duration" options={{ headerShown: false }} />
    </Stack>
  );
}