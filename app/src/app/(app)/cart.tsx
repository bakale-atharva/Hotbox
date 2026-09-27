import { api } from '@backend/convex/_generated/api';
import { useMutation } from 'convex/react';
import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MAX_QUANTITY } from '@/components/cart/cart-provider';
import { PizzaImage } from '@/components/menu/pizza-image';
import { RouteErrorBoundary } from '@/components/route-error';
import { Button } from '@/components/ui/button';
import { QuantityStepper } from '@/components/ui/quantity-stepper';
import { StateView } from '@/components/ui/state-view';
import { TextField } from '@/components/ui/text-field';
import { Radius } from '@/constants/theme';
import { useCartDetails, type CartDetailLine } from '@/hooks/use-cart-details';
import { useTheme } from '@/hooks/use-theme';
import { errorMessage } from '@/utils/errors';
import { formatPrice } from '@/utils/format';
import { haptics } from '@/utils/haptics';
import { SIZE_LABEL } from '@/utils/order-status';

export { RouteErrorBoundary as ErrorBoundary };

type FieldErrors = { address?: string; phone?: string };

function validate(address: string, phone: string): FieldErrors {
  const errors: FieldErrors = {};
  if (address.trim().length < 5) errors.address = 'Enter your full delivery address.';
  if (phone.replace(/\D/g, '').length < 7) errors.phone = 'Enter a phone number the driver can call.';
  return errors;
}

export default function CartScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const cart = useCartDetails();
  const placeOrder = useMutation(api.orders.place);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [placing, setPlacing] = useState(false);

  if (cart.lines.length === 0) {
    return (
      <StateView
        icon={{ sf: 'bag', md: 'shopping_bag' }}
        title="Your cart is empty"
        message="Add a pizza or two from the menu."
        action={<Button label="Browse the menu" size="md" onPress={() => router.back()} />}
      />
    );
  }

  const orderable = cart.lines.filter((l) => !l.unavailable);

  async function onPlaceOrder() {
    const fieldErrors = validate(cart.draft.address, cart.draft.phone);
    setErrors(fieldErrors);
    setSubmitError(null);
    if (Object.keys(fieldErrors).length > 0) {
      haptics.error();
      return;
    }
    setPlacing(true);
    try {
      const orderId = await placeOrder({
        items: orderable.map(({ pizzaId, size, quantity }) => ({ pizzaId, size, quantity })),
        address: cart.draft.address,
        phone: cart.draft.phone,
        notes: cart.draft.notes.trim() || undefined,
      });
      haptics.success();
      cart.clear();
      router.replace({ pathname: '/orders/[id]', params: { id: orderId, placed: '1' } });
    } catch (error) {
      haptics.error();
      // Keep the cart and the form so the customer can fix things and retry.
      setSubmitError(errorMessage(error));
    } finally {
      setPlacing(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.background }}
      behavior={process.env.EXPO_OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={{ flex: 1 }}
        keyboardShouldPersistTaps="handled"
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ padding: 16, gap: 20, width: '100%', maxWidth: 640, alignSelf: 'center' }}>
        <View style={{ gap: 12 }}>
          {cart.lines.map((line) => (
            <CartRow
              key={`${line.pizzaId}-${line.size}`}
              line={line}
              onQuantity={(q) => cart.setQuantity(line.pizzaId, line.size, q)}
            />
          ))}
        </View>

        {cart.hasUnavailable && (
          <Notice tone="warning">
            Some pizzas sold out or left the menu. They won&apos;t be ordered; remove them or order the rest.
          </Notice>
        )}

        <View
          style={{
            gap: 8,
            padding: 16,
            borderRadius: Radius.lg,
            borderCurve: 'continuous',
            backgroundColor: theme.card,
          }}>
          <Row label="Subtotal" value={formatPrice(cart.subtotal)} />
          <Row label="Delivery" value={formatPrice(cart.deliveryFee)} />
          <View style={{ height: 1, backgroundColor: theme.border, marginVertical: 4 }} />
          <Row label="Total" value={formatPrice(cart.total)} strong />
          <Text style={{ color: theme.textSecondary, fontSize: 13 }}>
            Pay in cash when your pizza arrives.
          </Text>
        </View>

        <View style={{ gap: 14 }}>
          <Text style={{ color: theme.text, fontSize: 18, fontWeight: '700' }}>Delivery details</Text>
          <TextField
            label="Address"
            value={cart.draft.address}
            onChangeText={(address) => cart.setDraft({ address })}
            placeholder="Street, building, flat"
            autoComplete="street-address"
            textContentType="fullStreetAddress"
            multiline
            error={errors.address}
          />
          <TextField
            label="Phone"
            value={cart.draft.phone}
            onChangeText={(phone) => cart.setDraft({ phone })}
            placeholder="+91 98200 12345"
            keyboardType="phone-pad"
            autoComplete="tel"
            textContentType="telephoneNumber"
            error={errors.phone}
          />
          <TextField
            label="Notes for the kitchen (optional)"
            value={cart.draft.notes}
            onChangeText={(notes) => cart.setDraft({ notes })}
            placeholder="Ring the bell, extra crispy…"
            maxLength={500}
          />
        </View>

        {submitError && <Notice tone="error">{submitError}</Notice>}
      </ScrollView>

      <View
        style={{
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: Math.max(insets.bottom, 16),
          borderTopWidth: 1,
          borderTopColor: theme.border,
          backgroundColor: theme.background,
        }}>
        <Button
          label={placing ? 'Placing order…' : 'Place order · Cash on delivery'}
          detail={placing ? undefined : formatPrice(cart.total)}
          loading={placing}
          disabled={orderable.length === 0 || cart.isLoading}
          onPress={onPlaceOrder}
          style={{ width: '100%', maxWidth: 640, alignSelf: 'center' }}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

function CartRow({ line, onQuantity }: { line: CartDetailLine; onQuantity: (quantity: number) => void }) {
  const theme = useTheme();
  const name = line.pizza?.name ?? 'Unavailable pizza';
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 10,
        borderRadius: Radius.lg,
        borderCurve: 'continuous',
        backgroundColor: theme.card,
        opacity: line.unavailable ? 0.6 : 1,
      }}>
      <PizzaImage
        uri={line.pizza?.imageUrl}
        emojiSize={28}
        style={{ width: 56, height: 56, borderRadius: Radius.md }}
      />
      <View style={{ flex: 1, gap: 2 }}>
        <Text numberOfLines={1} style={{ color: theme.text, fontSize: 16, fontWeight: '700' }}>
          {name}
        </Text>
        <Text style={{ color: line.unavailable ? theme.destructive : theme.textSecondary, fontSize: 13 }}>
          {line.unavailable
            ? 'Sold out'
            : `${SIZE_LABEL[line.size]} · ${formatPrice(line.unitPrice * line.quantity)}`}
        </Text>
      </View>
      <QuantityStepper
        compact
        min={0}
        max={MAX_QUANTITY}
        value={line.quantity}
        onChange={onQuantity}
        label={`${name} quantity`}
      />
    </View>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  const theme = useTheme();
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <Text style={{ color: strong ? theme.text : theme.textSecondary, fontSize: strong ? 17 : 15, fontWeight: strong ? '700' : '500' }}>
        {label}
      </Text>
      <Text
        selectable
        style={{
          color: theme.text,
          fontSize: strong ? 17 : 15,
          fontWeight: strong ? '800' : '600',
          fontVariant: ['tabular-nums'],
        }}>
        {value}
      </Text>
    </View>
  );
}

function Notice({ tone, children }: { tone: 'warning' | 'error'; children: React.ReactNode }) {
  const theme = useTheme();
  const color = tone === 'error' ? theme.destructive : theme.statusPending;
  return (
    <View
      style={{
        padding: 12,
        borderRadius: Radius.md,
        borderWidth: 1,
        borderColor: color,
        backgroundColor: theme.card,
      }}>
      <Text selectable style={{ color, fontSize: 14, lineHeight: 20 }}>
        {children}
      </Text>
    </View>
  );
}
