import { Stack } from 'expo-router';

import { useTheme } from '@/hooks/use-theme';

export default function AppLayout() {
  const theme = useTheme();

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="cart"
        options={{
          presentation: 'formSheet',
          sheetGrabberVisible: true,
          sheetAllowedDetents: [0.75, 1],
          sheetCornerRadius: 24,
          headerShown: true,
          title: 'Your cart',
          headerShadowVisible: false,
          headerStyle: { backgroundColor: theme.background },
          contentStyle: { backgroundColor: theme.background },
        }}
      />
    </Stack>
  );
}
