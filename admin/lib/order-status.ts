import type { Doc } from "@backend/convex/_generated/dataModel";

export type Order = Doc<"orders">;
export type OrderStatus = Order["status"];

type StatusMeta = {
  label: string;
  /** Tailwind classes for badges, using the shared status color tokens. */
  badgeClassName: string;
  dotClassName: string;
  /** The status an admin can advance to, and the button label for it. */
  next?: { status: OrderStatus; action: string };
  canCancel: boolean;
};

export const ORDER_STATUS: Record<OrderStatus, StatusMeta> = {
  pending: {
    label: "Pending",
    badgeClassName: "bg-status-pending/15 text-status-pending",
    dotClassName: "bg-status-pending",
    next: { status: "cooking", action: "Start cooking" },
    canCancel: true,
  },
  cooking: {
    label: "Cooking",
    badgeClassName: "bg-status-cooking/15 text-status-cooking",
    dotClassName: "bg-status-cooking",
    next: { status: "out_for_delivery", action: "Send out" },
    canCancel: true,
  },
  out_for_delivery: {
    label: "Out for delivery",
    badgeClassName:
      "bg-status-out-for-delivery/15 text-status-out-for-delivery",
    dotClassName: "bg-status-out-for-delivery",
    next: { status: "delivered", action: "Mark delivered" },
    canCancel: false,
  },
  delivered: {
    label: "Delivered",
    badgeClassName: "bg-status-delivered/15 text-status-delivered",
    dotClassName: "bg-status-delivered",
    canCancel: false,
  },
  cancelled: {
    label: "Cancelled",
    badgeClassName: "bg-status-cancelled/15 text-status-cancelled",
    dotClassName: "bg-status-cancelled",
    canCancel: false,
  },
};

/** When the order was placed (older orders predate the `placedAt` field). */
export function placedAt(order: Order): number {
  return order.placedAt ?? order._creationTime;
}

/** When the order entered its current status. */
export function statusSince(order: Order): number {
  switch (order.status) {
    case "cooking":
      return order.cookingAt ?? placedAt(order);
    case "out_for_delivery":
      return order.outForDeliveryAt ?? placedAt(order);
    case "delivered":
      return order.deliveredAt ?? placedAt(order);
    case "cancelled":
      return order.cancelledAt ?? placedAt(order);
    default:
      return placedAt(order);
  }
}

export const SIZE_LABEL = { small: "S", medium: "M", large: "L" } as const;
