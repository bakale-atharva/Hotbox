import * as Haptics from 'expo-haptics';

// Haptics are an iOS nicety; skip them elsewhere (and on web, where they no-op).
const enabled = process.env.EXPO_OS === 'ios';

export const haptics = {
  tap: () => enabled && void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  select: () => enabled && void Haptics.selectionAsync(),
  success: () =>
    enabled && void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  error: () => enabled && void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
};
