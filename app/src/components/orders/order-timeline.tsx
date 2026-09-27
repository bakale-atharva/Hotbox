import { Text, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { useTheme } from '@/hooks/use-theme';
import { formatTime } from '@/utils/format';
import { ORDER_STATUS, placedAt, type Order, type OrderStatus } from '@/utils/order-status';

const STEPS: { status: OrderStatus; at: (o: Order) => number | undefined }[] = [
  { status: 'pending', at: (o) => placedAt(o) },
  { status: 'cooking', at: (o) => o.cookingAt },
  { status: 'out_for_delivery', at: (o) => o.outForDeliveryAt },
  { status: 'delivered', at: (o) => o.deliveredAt },
];

/** Vertical progress tracker; updates live as the kitchen advances the order. */
export function OrderTimeline({ order }: { order: Order }) {
  const theme = useTheme();
  const steps =
    order.status === 'cancelled'
      ? [
          STEPS[0],
          ...STEPS.slice(1).filter((s) => s.at(order) !== undefined),
          { status: 'cancelled' as const, at: (o: Order) => o.cancelledAt },
        ]
      : STEPS;
  const currentIndex = steps.findIndex((s) => s.status === order.status);

  return (
    <View>
      {steps.map((step, index) => {
        const at = step.at(order);
        const done = at !== undefined;
        const current = index === currentIndex;
        const meta = ORDER_STATUS[step.status];
        const color = done ? theme[meta.color] : theme.textSecondary;
        const isLast = index === steps.length - 1;

        return (
          <View key={step.status} style={{ flexDirection: 'row', gap: 14 }}>
            <View style={{ alignItems: 'center', width: 36 }}>
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: done ? `${theme[meta.color]}22` : theme.backgroundElement,
                  borderWidth: current ? 2 : 0,
                  borderColor: color,
                }}>
                <Icon sf={meta.sf as never} md={meta.md} size={17} color={color} />
              </View>
              {!isLast && (
                <View
                  style={{
                    width: 2,
                    flex: 1,
                    minHeight: 22,
                    backgroundColor: steps[index + 1] && steps[index + 1].at(order) !== undefined ? color : theme.border,
                  }}
                />
              )}
            </View>
            <View style={{ flex: 1, paddingTop: 6, paddingBottom: isLast ? 0 : 18, gap: 2 }}>
              <Text
                style={{
                  color: done ? theme.text : theme.textSecondary,
                  fontSize: 16,
                  fontWeight: current ? '800' : '600',
                }}>
                {meta.label}
              </Text>
              {done ? (
                <Text style={{ color: theme.textSecondary, fontSize: 13, fontVariant: ['tabular-nums'] }}>
                  {formatTime(at)}
                  {current ? ` · ${meta.blurb}` : ''}
                </Text>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}
