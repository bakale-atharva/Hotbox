import { Link } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { useCart } from '@/components/cart/cart-provider';
import { PizzaImage } from '@/components/menu/pizza-image';
import { Radius } from '@/constants/theme';
import type { MenuPizza } from '@/hooks/use-cart-details';
import { useTheme } from '@/hooks/use-theme';
import { formatPrice } from '@/utils/format';
import { haptics } from '@/utils/haptics';
import { SIZES } from '@/utils/order-status';

export function PizzaCard({ pizza }: { pizza: MenuPizza }) {
  const theme = useTheme();
  const { add } = useCart();

  return (
    <Link href={{ pathname: '/pizza/[id]', params: { id: pizza._id } }} asChild>
      <Link.Trigger>
        <Pressable
          accessibilityLabel={`${pizza.name}, from ${formatPrice(pizza.prices.small)}${pizza.soldOut ? ', sold out' : ''}`}
          style={({ pressed }) => ({
            flex: 1,
            borderRadius: Radius.xl,
            borderCurve: 'continuous',
            backgroundColor: theme.card,
            overflow: 'hidden',
            boxShadow: '0 2px 10px rgba(28, 25, 23, 0.06)',
            opacity: pressed ? 0.9 : 1,
          })}>
          {/* iOS 18+: the photo zooms into the detail screen's hero image. */}
          <Link.AppleZoom>
            <PizzaImage uri={pizza.imageUrl} style={{ aspectRatio: 1, width: '100%' }} />
          </Link.AppleZoom>

          {pizza.soldOut && (
            <View
              style={{
                position: 'absolute',
                top: 10,
                left: 10,
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: Radius.pill,
                backgroundColor: theme.text,
              }}>
              <Text style={{ color: theme.background, fontSize: 12, fontWeight: '700' }}>Sold out</Text>
            </View>
          )}

          <View style={{ padding: 12, gap: 4 }}>
            <Text numberOfLines={1} style={{ color: theme.text, fontSize: 16, fontWeight: '700' }}>
              {pizza.name}
            </Text>
            <Text numberOfLines={2} style={{ color: theme.textSecondary, fontSize: 13, lineHeight: 18 }}>
              {pizza.description}
            </Text>
            <Text
              style={{
                color: pizza.soldOut ? theme.textSecondary : theme.primary,
                fontSize: 15,
                fontWeight: '700',
                marginTop: 4,
                fontVariant: ['tabular-nums'],
              }}>
              from {formatPrice(pizza.prices.small)}
            </Text>
          </View>
        </Pressable>
      </Link.Trigger>

      {/* iOS: long-press to peek at the pizza and quick-add a size. */}
      <Link.Preview />
      {!pizza.soldOut && (
        <Link.Menu title={pizza.name}>
          {SIZES.map((size) => (
            <Link.MenuAction
              key={size.key}
              title={`Add ${size.label} · ${formatPrice(pizza.prices[size.key])}`}
              icon="plus.circle"
              onPress={() => {
                add(pizza._id, size.key);
                haptics.success();
              }}
            />
          ))}
        </Link.Menu>
      )}
    </Link>
  );
}
