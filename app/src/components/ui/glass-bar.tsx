import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import type { ReactNode } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/**
 * Floating bottom action bar. Liquid Glass on iOS 26+, a translucent card
 * everywhere else (Android, web, older iOS).
 */
export function GlassBar({ children, bottomOffset = 0 }: { children: ReactNode; bottomOffset?: number }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const glass = isLiquidGlassAvailable();

  const content = <View style={{ padding: 12, gap: 10 }}>{children}</View>;

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: Math.max(insets.bottom, 12) + bottomOffset,
        paddingHorizontal: 16,
        alignItems: 'center',
      }}>
      <View style={{ width: '100%', maxWidth: 560 }}>
        {glass ? (
          <GlassView
            glassEffectStyle="regular"
            isInteractive
            style={{ borderRadius: Radius.xl + 8, overflow: 'hidden' }}>
            {content}
          </GlassView>
        ) : (
          <View
            style={{
              borderRadius: Radius.xl + 8,
              borderCurve: 'continuous',
              backgroundColor: theme.card,
              borderWidth: 1,
              borderColor: theme.border,
              boxShadow: '0 12px 32px rgba(28, 25, 23, 0.12)',
            }}>
            {content}
          </View>
        )}
      </View>
    </View>
  );
}
