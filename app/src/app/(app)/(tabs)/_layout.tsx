import { api } from '@backend/convex/_generated/api';
import { useQuery } from 'convex/react';
import { usePathname } from 'expo-router';
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { View } from 'react-native';

import { useCart } from '@/components/cart/cart-provider';
import { CartAccessory, FloatingCartBar } from '@/components/cart/cart-bar';
import { useTheme } from '@/hooks/use-theme';
import { ACTIVE_STATUSES } from '@/utils/order-status';

export default function TabsLayout() {
  const theme = useTheme();
  const { count } = useCart();
  const pathname = usePathname();
  const orders = useQuery(api.orders.listMine);
  const activeOrders = orders?.filter((o) => ACTIVE_STATUSES.includes(o.status)).length ?? 0;

  // The pizza screen is a focused detail view with its own "Add to cart" bar:
  // hide the tab bar and the mini cart there.
  const onPizzaDetail = pathname.startsWith('/pizza/');
  const showCart = count > 0 && !onPizzaDetail;

  return (
    <View style={{ flex: 1 }}>
      <NativeTabs
        tintColor={theme.primary}
        minimizeBehavior="onScrollDown"
        hidden={onPizzaDetail}
        backgroundColor={process.env.EXPO_OS === 'ios' ? undefined : theme.card}
        indicatorColor={theme.secondary}>
        {/* iOS 26: the mini cart floats above the Liquid Glass tab bar. */}
        {process.env.EXPO_OS === 'ios' && showCart && (
          <NativeTabs.BottomAccessory>
            <CartAccessory />
          </NativeTabs.BottomAccessory>
        )}

        <NativeTabs.Trigger name="(menu)">
          <NativeTabs.Trigger.Icon sf={{ default: 'fork.knife', selected: 'fork.knife' }} md="restaurant_menu" />
          <NativeTabs.Trigger.Label>Menu</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="orders">
          <NativeTabs.Trigger.Icon sf={{ default: 'bag', selected: 'bag.fill' }} md="receipt_long" />
          <NativeTabs.Trigger.Label>Orders</NativeTabs.Trigger.Label>
          {activeOrders > 0 && (
            <NativeTabs.Trigger.Badge>{String(activeOrders)}</NativeTabs.Trigger.Badge>
          )}
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="account">
          <NativeTabs.Trigger.Icon
            sf={{ default: 'person.crop.circle', selected: 'person.crop.circle.fill' }}
            md="account_circle"
          />
          <NativeTabs.Trigger.Label>Account</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
      </NativeTabs>

      {/* Android & web don't support the bottom accessory: float the same bar instead. */}
      {process.env.EXPO_OS !== 'ios' && showCart && <FloatingCartBar />}
    </View>
  );
}
