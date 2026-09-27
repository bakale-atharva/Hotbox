import type { Doc } from '@backend/convex/_generated/dataModel';

import type { ThemeColor } from '@/constants/theme';

export type Order = Doc<'orders'>;
export type OrderStatus = Order['status'];
export type PizzaSize = Order['items'][number]['size'];

export const SIZES: { key: PizzaSize; label: string; short: string }[] = [
  { key: 'small', label: 'Small', short: 'S' },
  { key: 'medium', label: 'Medium', short: 'M' },
  { key: 'large', label: 'Large', short: 'L' },
];

export const SIZE_LABEL: Record<PizzaSize, string> = {
  small: 'Small',
  medium: 'Medium',
  large: 'Large',
};

export const ORDER_STATUS: Record<
  OrderStatus,
  { label: string; color: ThemeColor; sf: string; md: string; blurb: string }
> = {
  pending: {
    label: 'Order placed',
    color: 'statusPending',
    sf: 'clock.fill',
    md: 'schedule',
    blurb: 'The kitchen has your order.',
  },
  cooking: {
    label: 'Cooking',
    color: 'statusCooking',
    sf: 'flame.fill',
    md: 'local_fire_department',
    blurb: 'Your pizza is in the oven.',
  },
  out_for_delivery: {
    label: 'Out for delivery',
    color: 'statusOutForDelivery',
    sf: 'scooter',
    md: 'delivery_dining',
    blurb: 'Your driver is on the way.',
  },
  delivered: {
    label: 'Delivered',
    color: 'statusDelivered',
    sf: 'checkmark.circle.fill',
    md: 'check_circle',
    blurb: 'Enjoy your pizza!',
  },
  cancelled: {
    label: 'Cancelled',
    color: 'statusCancelled',
    sf: 'xmark.circle.fill',
    md: 'cancel',
    blurb: 'This order was cancelled.',
  },
};

export const ACTIVE_STATUSES: readonly OrderStatus[] = ['pending', 'cooking', 'out_for_delivery'];

/** When the order was placed (older orders predate the `placedAt` field). */
export function placedAt(order: Order): number {
  return order.placedAt ?? order._creationTime;
}
