import { router } from 'expo-router';
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/ui/icon';
import { Radius } from '@/constants/theme';
import { useCartDetails } from '@/hooks/use-cart-details';
import { useTheme } from '@/hooks/use-theme';
import { formatPrice, pluralize } from '@/utils/format';
import { haptics } from '@/utils/haptics';

function openCart() {
  haptics.tap();
  router.push('/cart');
}

/**
 * iOS 26 bottom accessory. Two instances render at once (regular + inline),
 * so all state comes from the cart context, never local state.
 */
export function CartAccessory() {
  const theme = useTheme();
  const placement = NativeTabs.BottomAccessory.usePlacement();
  const { count, subtotal } = useCartDetails();

  if (placement === 'inline') {
    return (
      <Pressable
        onPress={openCart}
        accessibilityLabel={`View cart, ${pluralize(count, 'item')}`}
        style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12 }}>
        <Icon sf="bag.fill" md="shopping_bag" size={18} color={theme.primary} />
        <Text style={{ color: theme.text, fontWeight: '600', fontVariant: ['tabular-nums'] }}>
          {count} · {formatPrice(subtotal)}
        </Text>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={openCart}
      accessibilityRole="button"
      accessibilityLabel={`View cart, ${pluralize(count, 'item')}, ${formatPrice(subtotal)}`}
      style={{
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 16,
      }}>
      <CountBadge count={count} />
      <Text style={{ flex: 1, color: theme.text, fontSize: 15, fontWeight: '600' }}>View cart</Text>
      <Text style={{ color: theme.text, fontSize: 15, fontWeight: '700', fontVariant: ['tabular-nums'] }}>
        {formatPrice(subtotal)}
      </Text>
    </Pressable>
  );
}

/** Android & web: a floating brand pill above the content. */
export function FloatingCartBar() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { count, subtotal } = useCartDetails();
  // Android's tab bar sits at the bottom; on web the tab pill floats at the top.
  const bottom = process.env.EXPO_OS === 'android' ? insets.bottom + 92 : 24;

  return (
    <View
      pointerEvents="box-none"
      style={{ position: 'absolute', left: 0, right: 0, bottom, alignItems: 'center', paddingHorizontal: 16 }}>
      <Pressable
        onPress={openCart}
        accessibilityRole="button"
        accessibilityLabel={`View cart, ${pluralize(count, 'item')}, ${formatPrice(subtotal)}`}
        style={({ pressed }) => ({
          width: '100%',
          maxWidth: 480,
          minHeight: 56,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          paddingHorizontal: 16,
          borderRadius: Radius.pill,
          backgroundColor: theme.primary,
          boxShadow: '0 10px 30px rgba(228, 87, 46, 0.35)',
          opacity: pressed ? 0.9 : 1,
        })}>
        <CountBadge count={count} inverted />
        <Text style={{ flex: 1, color: theme.primaryForeground, fontSize: 16, fontWeight: '700' }}>
          View cart
        </Text>
        <Text
          style={{
            color: theme.primaryForeground,
            fontSize: 16,
            fontWeight: '700',
            fontVariant: ['tabular-nums'],
          }}>
          {formatPrice(subtotal)}
        </Text>
      </Pressable>
    </View>
  );
}

function CountBadge({ count, inverted }: { count: number; inverted?: boolean }) {
  const theme = useTheme();
  return (
    <View
      style={{
        minWidth: 28,
        height: 28,
        paddingHorizontal: 6,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: inverted ? theme.primaryForeground : theme.primary,
      }}>
      <Text
        style={{
          color: inverted ? theme.primary : theme.primaryForeground,
          fontWeight: '800',
          fontVariant: ['tabular-nums'],
        }}>
        {count}
      </Text>
    </View>
  );
}
