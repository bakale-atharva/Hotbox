import { api } from '@backend/convex/_generated/api';
import type { Id } from '@backend/convex/_generated/dataModel';
import { useMutation, useQuery } from 'convex/react';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';

import { OrderTimeline } from '@/components/orders/order-timeline';
import { StatusPill } from '@/components/orders/status-pill';
import { RouteErrorBoundary } from '@/components/route-error';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { StateView } from '@/components/ui/state-view';
import { Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { errorMessage } from '@/utils/errors';
import { formatDateTime, formatPrice, shortOrderId } from '@/utils/format';
import { haptics } from '@/utils/haptics';
import { ORDER_STATUS, placedAt, SIZE_LABEL } from '@/utils/order-status';

export { RouteErrorBoundary as ErrorBoundary };

export default function OrderScreen() {
  const theme = useTheme();
  const { id, placed } = useLocalSearchParams<{ id: string; placed?: string }>();
  const order = useQuery(api.orders.getMine, { id: id as Id<'orders'> });
  const cancelMine = useMutation(api.orders.cancelMine);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  if (order === undefined) return <StateView loading />;
  if (order === null) {
    return (
      <StateView
        icon={{ sf: 'questionmark.circle', md: 'help' }}
        title="Order not found"
        message="It may belong to another account."
        action={<Button label="Back to orders" size="md" onPress={() => router.navigate('/orders')} />}
      />
    );
  }

  async function cancel() {
    setCancelling(true);
    setCancelError(null);
    try {
      await cancelMine({ id: id as Id<'orders'> });
      haptics.success();
    } catch (error) {
      haptics.error();
      setCancelError(errorMessage(error));
    } finally {
      setCancelling(false);
    }
  }

  function confirmCancel() {
    if (process.env.EXPO_OS === 'web') {
      // Alert has no buttons on web.
      if (window.confirm('Cancel this order? The kitchen will stop preparing it.')) void cancel();
      return;
    }
    Alert.alert('Cancel this order?', 'The kitchen will stop preparing it.', [
      { text: 'Keep order', style: 'cancel' },
      { text: 'Cancel order', style: 'destructive', onPress: () => void cancel() },
    ]);
  }

  const meta = ORDER_STATUS[order.status];

  return (
    <>
      <Stack.Screen options={{ title: shortOrderId(order._id) }} />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={{ backgroundColor: theme.background }}
        contentContainerStyle={{ padding: 16, gap: 16, width: '100%', maxWidth: 720, alignSelf: 'center', paddingBottom: 48 }}>
        {placed === '1' && order.status === 'pending' && (
          <View
            style={{
              flexDirection: 'row',
              gap: 12,
              alignItems: 'center',
              padding: 16,
              borderRadius: Radius.lg,
              backgroundColor: theme.secondary,
            }}>
            <Icon sf="checkmark.seal.fill" md="verified" size={26} color={theme.primary} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: theme.secondaryForeground, fontSize: 16, fontWeight: '800' }}>
                Order placed!
              </Text>
              <Text style={{ color: theme.secondaryForeground, fontSize: 14 }}>
                We&apos;ll update this screen live as your pizza moves along.
              </Text>
            </View>
          </View>
        )}

        <Card>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ color: theme.text, fontSize: 20, fontWeight: '800' }}>{meta.label}</Text>
            <StatusPill status={order.status} />
          </View>
          <Text style={{ color: theme.textSecondary, fontSize: 15 }}>{meta.blurb}</Text>
          <View style={{ height: 8 }} />
          <OrderTimeline order={order} />
        </Card>

        <Card title="Items">
          {order.items.map((item, index) => (
            <View key={index} style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
              <Text style={{ color: theme.text, fontSize: 15, flex: 1 }}>
                <Text style={{ color: theme.primary, fontWeight: '800' }}>{item.quantity}×</Text> {item.name}{' '}
                <Text style={{ color: theme.textSecondary }}>({SIZE_LABEL[item.size]})</Text>
              </Text>
              <Text style={{ color: theme.text, fontSize: 15, fontVariant: ['tabular-nums'] }}>
                {formatPrice(item.unitPrice * item.quantity)}
              </Text>
            </View>
          ))}
          <View style={{ height: 1, backgroundColor: theme.border, marginVertical: 4 }} />
          <Line label="Subtotal" value={formatPrice(order.subtotal)} />
          <Line label="Delivery" value={formatPrice(order.deliveryFee)} />
          <Line label="Total · cash on delivery" value={formatPrice(order.total)} strong />
        </Card>

        <Card title="Delivery">
          <Detail sf="mappin.and.ellipse" md="location_on">{order.address}</Detail>
          <Detail sf="phone" md="call">{order.phone}</Detail>
          {order.notes ? <Detail sf="note.text" md="sticky_note_2">{order.notes}</Detail> : null}
          <Detail sf="clock" md="schedule">Placed {formatDateTime(placedAt(order))}</Detail>
        </Card>

        {order.status === 'pending' && (
          <View style={{ gap: 8 }}>
            <Button
              label="Cancel order"
              variant="destructive"
              icon={{ sf: 'xmark.circle', md: 'cancel' }}
              loading={cancelling}
              onPress={confirmCancel}
            />
            {cancelError && (
              <Text selectable style={{ color: theme.destructive, textAlign: 'center' }}>
                {cancelError}
              </Text>
            )}
          </View>
        )}
      </ScrollView>
    </>
  );
}

function Card({ title, children }: { title?: string; children: React.ReactNode }) {
  const theme = useTheme();
  return (
    <View style={{ gap: 10, padding: 16, borderRadius: Radius.lg, borderCurve: 'continuous', backgroundColor: theme.card }}>
      {title && <Text style={{ color: theme.text, fontSize: 17, fontWeight: '700' }}>{title}</Text>}
      {children}
    </View>
  );
}

function Line({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  const theme = useTheme();
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <Text style={{ color: strong ? theme.text : theme.textSecondary, fontWeight: strong ? '700' : '500' }}>
        {label}
      </Text>
      <Text selectable style={{ color: theme.text, fontWeight: strong ? '800' : '600', fontVariant: ['tabular-nums'] }}>
        {value}
      </Text>
    </View>
  );
}

function Detail({ sf, md, children }: { sf: string; md: string; children: React.ReactNode }) {
  const theme = useTheme();
  return (
    <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
      <Icon sf={sf as never} md={md} size={16} color={theme.textSecondary} style={{ marginTop: 2 }} />
      <Text selectable style={{ color: theme.text, fontSize: 15, flex: 1, lineHeight: 21 }}>
        {children}
      </Text>
    </View>
  );
}
