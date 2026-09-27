import { Stack } from 'expo-router';

import { useTheme } from '@/hooks/use-theme';

export default function MenuStack() {
  const theme = useTheme();

  return (
    <Stack
      screenOptions={{
        headerTransparent: process.env.EXPO_OS === 'ios',
        headerShadowVisible: false,
        headerLargeTitleShadowVisible: false,
        headerLargeStyle: { backgroundColor: 'transparent' },
        headerBackButtonDisplayMode: 'minimal',
        headerTintColor: theme.primary,
        headerTitleStyle: { color: theme.text },
      }}>
      <Stack.Screen name="index" options={{ title: 'Hotbox', headerLargeTitleEnabled: true }} />
      <Stack.Screen name="pizza/[id]" options={{ title: '', headerLargeTitleEnabled: false }} />
    </Stack>
  );
}
