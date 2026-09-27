import type { OrderStatus } from "./validators";

/** Flat delivery fee in cents. */
export const DELIVERY_FEE = 299;

export const MAX_LINE_ITEMS = 20;
export const MAX_QUANTITY_PER_ITEM = 20;

/** The single forward step allowed from each status. */
export const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  pending: "cooking",
  cooking: "out_for_delivery",
  out_for_delivery: "delivered",
};

/** Admins can cancel before the order leaves the store; customers only while pending. */
export const ADMIN_CANCELLABLE: readonly OrderStatus[] = ["pending", "cooking"];
export const CUSTOMER_CANCELLABLE: readonly OrderStatus[] = ["pending"];

export const ACTIVE_STATUSES: readonly OrderStatus[] = [
  "pending",
  "cooking",
  "out_for_delivery",
];

/** The timestamp field recorded when an order enters a status. */
export const STATUS_TIMESTAMP_FIELD = {
  cooking: "cookingAt",
  out_for_delivery: "outForDeliveryAt",
  delivered: "deliveredAt",
  cancelled: "cancelledAt",
} as const;
