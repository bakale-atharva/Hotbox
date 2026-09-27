import { ClerkProvider, useAuth } from '@clerk/expo';
import { tokenCache } from '@clerk/expo/token-cache';
import { Stack } from 'expo-router';
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
  type Theme as NavigationTheme,
} from 'expo-router/react-navigation';
import { useColorScheme } from 'react-native';

import { CartProvider } from '@/components/cart/cart-provider';
import ConvexClientProvider from '@/components/ConvexClientProvider';
import { Colors } from '@/constants/theme';

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error('EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY is not set');
}

/** React Navigation themes in Hotbox colors, so headers and tabs match the brand. */
function navigationTheme(scheme: 'light' | 'dark'): NavigationTheme {
  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
  const c = Colors[scheme];
  return {
    ...base,
    colors: {
      ...base.colors,
      primary: c.primary,
      background: c.background,
      card: c.background,
      text: c.text,
      border: c.border,
      notification: c.primary,
    },
  };
}

function RootNavigator() {
  const { isLoaded, isSignedIn } = useAuth();

  // Wait for Clerk to restore the session so signed-in users never see sign-in flash.
  if (!isLoaded) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!isSignedIn}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
      <Stack.Protected guard={!!isSignedIn}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <ConvexClientProvider>
        <ThemeProvider value={navigationTheme(scheme)}>
          <CartProvider>
            <RootNavigator />
          </CartProvider>
        </ThemeProvider>
      </ConvexClientProvider>
    </ClerkProvider>
  );
}
