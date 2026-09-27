import type { SFSymbol } from 'expo-symbols';
import { ActivityIndicator, Pressable, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Variant = 'primary' | 'secondary' | 'ghost' | 'destructive';

export function Button({
  label,
  detail,
  onPress,
  variant = 'primary',
  size = 'lg',
  icon,
  loading,
  disabled,
  style,
}: {
  label: string;
  /** Right-aligned secondary text, e.g. a price. */
  detail?: string;
  onPress?: () => void;
  variant?: Variant;
  size?: 'md' | 'lg';
  icon?: { sf: SFSymbol; md: string };
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const theme = useTheme();
  const palette: Record<Variant, { bg: string; fg: string }> = {
    primary: { bg: theme.primary, fg: theme.primaryForeground },
    secondary: { bg: theme.secondary, fg: theme.secondaryForeground },
    ghost: { bg: 'transparent', fg: theme.text },
    destructive: { bg: 'transparent', fg: theme.destructive },
  };
  const { bg, fg } = palette[variant];
  const inactive = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!inactive, busy: !!loading }}
      onPress={onPress}
      disabled={inactive}
      style={({ pressed }) => [
        {
          minHeight: size === 'lg' ? 52 : 40,
          paddingHorizontal: size === 'lg' ? 20 : 14,
          borderRadius: Radius.lg,
          borderCurve: 'continuous',
          backgroundColor: bg,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: detail ? 'space-between' : 'center',
          gap: 8,
          opacity: inactive ? 0.5 : pressed ? 0.85 : 1,
        },
        variant === 'primary' && !inactive && { boxShadow: '0 6px 16px rgba(228, 87, 46, 0.3)' },
        style,
      ]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        {loading ? (
          <ActivityIndicator color={fg} />
        ) : (
          icon && <Icon sf={icon.sf} md={icon.md} size={18} color={fg} weight="semibold" />
        )}
        <Text style={{ color: fg, fontSize: size === 'lg' ? 17 : 15, fontWeight: '600' }}>
          {label}
        </Text>
      </View>
      {detail && (
        <Text
          style={{
            color: fg,
            fontSize: size === 'lg' ? 17 : 15,
            fontWeight: '700',
            fontVariant: ['tabular-nums'],
          }}>
          {detail}
        </Text>
      )}
    </Pressable>
  );
}
