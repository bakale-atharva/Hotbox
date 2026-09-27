import { Stack } from 'expo-router';

import { useTheme } from '@/hooks/use-theme';

export default function OrdersStack() {
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
      <Stack.Screen name="index" options={{ title: 'Orders', headerLargeTitleEnabled: true }} />
      <Stack.Screen name="[id]" options={{ title: 'Order', headerLargeTitleEnabled: false }} />
    </Stack>
  );
}
