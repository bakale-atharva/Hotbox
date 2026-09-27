import { api } from '@backend/convex/_generated/api';
import type { Id } from '@backend/convex/_generated/dataModel';
import { useQuery } from 'convex/react';
import { Link, router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, useWindowDimensions, View } from 'react-native';

import { useCart } from '@/components/cart/cart-provider';
import { PizzaImage } from '@/components/menu/pizza-image';
import { SizePicker } from '@/components/menu/size-picker';
import { RouteErrorBoundary } from '@/components/route-error';
import { Button } from '@/components/ui/button';
import { GlassBar } from '@/components/ui/glass-bar';
import { QuantityStepper } from '@/components/ui/quantity-stepper';
import { StateView } from '@/components/ui/state-view';
import { Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatPrice } from '@/utils/format';
import { haptics } from '@/utils/haptics';
import { SIZE_LABEL, type PizzaSize } from '@/utils/order-status';

export { RouteErrorBoundary as ErrorBoundary };

export default function PizzaScreen() {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const { id } = useLocalSearchParams<{ id: string }>();
  const pizza = useQuery(api.pizzas.get, { id: id as Id<'pizzas'> });
  const { add } = useCart();
  const [size, setSize] = useState<PizzaSize>('medium');
  const [quantity, setQuantity] = useState(1);

  if (pizza === undefined) return <StateView loading />;

  if (pizza === null) {
    return (
      <StateView
        icon={{ sf: 'fork.knife', md: 'restaurant_menu' }}
        title="This pizza isn't on the menu"
        message="It may have been taken off the menu. Pick another favourite."
        action={<Button label="Back to menu" size="md" onPress={() => router.back()} />}
      />
    );
  }

  const unitPrice = pizza.prices[size];
  const heroHeight = Math.min(width, 520) * 0.85;

  function addToCart() {
    if (!pizza || pizza.soldOut) return;
    add(pizza._id, size, quantity);
    haptics.success();
    if (router.canGoBack()) router.back();
    else router.replace('/');
  }

  return (
    <>
      <Stack.Screen options={{ title: pizza.name }} />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={{ backgroundColor: theme.background }}
        contentContainerStyle={{ paddingBottom: 200, alignItems: 'center' }}>
        <View style={{ width: '100%', maxWidth: 720 }}>
          {/* Zoom transition lands here from the menu card (iOS 18+). */}
          <Link.AppleZoomTarget>
            <PizzaImage uri={pizza.imageUrl} emojiSize={120} style={{ width: '100%', height: heroHeight }} />
          </Link.AppleZoomTarget>

          <View style={{ padding: 20, gap: 20 }}>
            <View style={{ gap: 8 }}>
              <Text selectable style={{ color: theme.text, fontSize: 30, fontWeight: '800' }}>
                {pizza.name}
              </Text>
              {pizza.description ? (
                <Text selectable style={{ color: theme.textSecondary, fontSize: 16, lineHeight: 23 }}>
                  {pizza.description}
                </Text>
              ) : null}
              {pizza.soldOut && (
                <Text style={{ color: theme.destructive, fontSize: 15, fontWeight: '600' }}>
                  Sold out right now. An ingredient ran out.
                </Text>
              )}
            </View>

            {pizza.ingredients.length > 0 && (
              <View style={{ gap: 10 }}>
                <SectionLabel>Ingredients</SectionLabel>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {pizza.ingredients.map((ingredient) => (
                    <View
                      key={ingredient._id}
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: Radius.pill,
                        backgroundColor: ingredient.inStock ? theme.secondary : theme.backgroundElement,
                      }}>
                      <Text
                        style={{
                          color: ingredient.inStock ? theme.secondaryForeground : theme.textSecondary,
                          fontSize: 14,
                          fontWeight: '600',
                          textDecorationLine: ingredient.inStock ? 'none' : 'line-through',
                        }}>
                        {ingredient.name}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            <View style={{ gap: 10 }}>
              <SectionLabel>Size</SectionLabel>
              <SizePicker value={size} onChange={setSize} enabled={!pizza.soldOut} />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                {(['small', 'medium', 'large'] as const).map((s) => (
                  <Text
                    key={s}
                    style={{
                      flex: 1,
                      textAlign: 'center',
                      color: s === size ? theme.primary : theme.textSecondary,
                      fontWeight: s === size ? '700' : '500',
                      fontVariant: ['tabular-nums'],
                    }}>
                    {formatPrice(pizza.prices[s])}
                  </Text>
                ))}
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <GlassBar>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ color: theme.textSecondary, fontSize: 14, fontWeight: '600' }}>
            {SIZE_LABEL[size]} · {formatPrice(unitPrice)} each
          </Text>
          <QuantityStepper value={quantity} onChange={setQuantity} />
        </View>
        <Button
          label={pizza.soldOut ? 'Sold out' : 'Add to cart'}
          detail={pizza.soldOut ? undefined : formatPrice(unitPrice * quantity)}
          icon={pizza.soldOut ? undefined : { sf: 'bag.badge.plus', md: 'add_shopping_cart' }}
          disabled={pizza.soldOut}
          onPress={addToCart}
        />
      </GlassBar>
    </>
  );
}

function SectionLabel({ children }: { children: string }) {
  const theme = useTheme();
  return (
    <Text
      style={{
        color: theme.textSecondary,
        fontSize: 13,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.6,
      }}>
      {children}
    </Text>
  );
}
