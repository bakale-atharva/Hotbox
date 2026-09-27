import type { SFSymbol } from 'expo-symbols';
import type { ReactNode } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { useTheme } from '@/hooks/use-theme';

/** Centered loading / empty / error state for data screens. */
export function StateView({
  loading,
  icon,
  title,
  message,
  action,
}: {
  loading?: boolean;
  icon?: { sf: SFSymbol; md: string };
  title?: string;
  message?: string;
  action?: ReactNode;
}) {
  const theme = useTheme();
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        padding: 32,
        minHeight: 280,
      }}>
      {loading ? (
        <ActivityIndicator color={theme.primary} size="large" />
      ) : (
        icon && (
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: theme.secondary,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Icon sf={icon.sf} md={icon.md} size={30} color={theme.primary} />
          </View>
        )
      )}
      {title && (
        <Text style={{ color: theme.text, fontSize: 19, fontWeight: '700', textAlign: 'center' }}>
          {title}
        </Text>
      )}
      {message && (
        <Text
          selectable
          style={{ color: theme.textSecondary, fontSize: 15, textAlign: 'center', maxWidth: 320 }}>
          {message}
        </Text>
      )}
      {action}
    </View>
  );
}
