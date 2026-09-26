import { DarkTheme, DefaultTheme, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useColorScheme } from "react-native";

import { AnimatedSplashOverlay } from "@/components/animated-icon";
import AppTabs from "@/components/app-tabs";

import { ClerkProvider } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { Slot } from "expo-router";

const envPublishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!envPublishableKey) {
  throw new Error("EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY is not set");
}

const publishableKey: string = envPublishableKey;

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
        <AnimatedSplashOverlay />
        <AppTabs />
      </ClerkProvider>
    </ThemeProvider>
  );
}
