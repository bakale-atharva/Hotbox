import { api } from '@backend/convex/_generated/api';
import { useQuery } from 'convex/react';
import { Link, router } from 'expo-router';
import { Pressable, SectionList, Text, View } from 'react-native';

import { StatusPill } from '@/components/orders/status-pill';
import { RouteErrorBoundary } from '@/components/route-error';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { StateView } from '@/components/ui/state-view';
import { Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatDateTime, formatPrice, pluralize, shortOrderId } from '@/utils/format';
import { ACTIVE_STATUSES, placedAt, SIZE_LABEL, type Order } from '@/utils/order-status';

export { RouteErrorBoundary as ErrorBoundary };

export default function OrdersScreen() {
  const theme = useTheme();
  const orders = useQuery(api.orders.listMine);

  const byNewest = (a: Order, b: Order) => placedAt(b) - placedAt(a);
  const active = orders?.filter((o) => ACTIVE_STATUSES.includes(o.status)).sort(byNewest) ?? [];
  const past = orders?.filter((o) => !ACTIVE_STATUSES.includes(o.status)).sort(byNewest) ?? [];
  const sections = [
    { title: 'In progress', data: active },
    { title: 'Past orders', data: past },
  ].filter((s) => s.data.length > 0);

  return (
    <SectionList
      sections={sections}
      keyExtractor={(o) => o._id}
      contentInsetAdjustmentBehavior="automatic"
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={{ padding: 16, gap: 12, width: '100%', maxWidth: 720, alignSelf: 'center', flexGrow: 1 }}
      stickySectionHeadersEnabled={false}
      renderSectionHeader={({ section }) => (
        <Text
          style={{
            color: theme.textSecondary,
            fontSize: 13,
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: 0.6,
            marginTop: 8,
            marginBottom: 4,
          }}>
          {section.title}
        </Text>
      )}
      renderItem={({ item }) => <OrderRow order={item} />}
      ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
      ListEmptyComponent={
        orders === undefined ? (
          <StateView loading />
        ) : (
          <StateView
            icon={{ sf: 'bag', md: 'receipt_long' }}
            title="No orders yet"
            message="When you order, you can follow it here from oven to door."
            action={<Button label="Order a pizza" size="md" onPress={() => router.navigate('/')} />}
          />
        )
      }
    />
  );
}

function OrderRow({ order }: { order: Order }) {
  const theme = useTheme();
  const count = order.items.reduce((n, i) => n + i.quantity, 0);
  const summary = order.items.map((i) => `${i.quantity}× ${i.name} (${SIZE_LABEL[i.size]})`).join(', ');

  return (
    <Link href={{ pathname: '/orders/[id]', params: { id: order._id } }} asChild>
      <Link.Trigger>
        <Pressable
          accessibilityLabel={`Order ${shortOrderId(order._id)}, ${pluralize(count, 'pizza')}, ${formatPrice(order.total)}`}
          style={({ pressed }) => ({
            gap: 10,
            padding: 16,
            borderRadius: Radius.lg,
            borderCurve: 'continuous',
            backgroundColor: theme.card,
            boxShadow: '0 1px 6px rgba(28, 25, 23, 0.05)',
            opacity: pressed ? 0.85 : 1,
          })}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
            <View style={{ gap: 2, flex: 1 }}>
              <Text style={{ color: theme.text, fontSize: 16, fontWeight: '700' }}>
                {shortOrderId(order._id)}
              </Text>
              <Text style={{ color: theme.textSecondary, fontSize: 13 }}>{formatDateTime(placedAt(order))}</Text>
            </View>
            <StatusPill status={order.status} />
          </View>
          <Text numberOfLines={2} style={{ color: theme.text, fontSize: 14, lineHeight: 20 }}>
            {summary}
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ color: theme.text, fontSize: 15, fontWeight: '700', fontVariant: ['tabular-nums'] }}>
              {formatPrice(order.total)}
            </Text>
            <Icon sf="chevron.right" md="chevron_right" size={14} color={theme.textSecondary} />
          </View>
        </Pressable>
      </Link.Trigger>
      <Link.Preview />
    </Link>
  );
}
