import { Text, View } from 'react-native';

import { Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { ORDER_STATUS, type OrderStatus } from '@/utils/order-status';

export function StatusPill({ status }: { status: OrderStatus }) {
  const theme = useTheme();
  const meta = ORDER_STATUS[status];
  const color = theme[meta.color];
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: Radius.pill,
        backgroundColor: `${color}22`,
      }}>
      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: color }} />
      <Text style={{ color, fontSize: 12, fontWeight: '700' }}>{meta.label}</Text>
    </View>
  );
}
