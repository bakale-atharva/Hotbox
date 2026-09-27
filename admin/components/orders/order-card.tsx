"use client";

import { Clock, MapPin } from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  formatElapsed,
  formatPrice,
  formatTime,
  shortOrderId,
} from "@/lib/format";
import {
  SIZE_LABEL,
  placedAt,
  statusSince,
  type Order,
} from "@/lib/order-status";
import { OrderActions } from "./order-actions";

export function OrderCard({ order, now }: { order: Order; now: number }) {
  const isFinal = order.status === "delivered" || order.status === "cancelled";
  const elapsedMin = (now - statusSince(order)) / 60_000;
  // Nudge the kitchen when an order has sat in one step for a while.
  const isLate = !isFinal && elapsedMin >= 20;

  return (
    <Card size="sm" className="gap-3 transition-shadow hover:shadow-md">
      <CardHeader className="flex flex-row items-start justify-between gap-2">
        <Link href={`/orders/${order._id}`} className="min-w-0 hover:underline">
          <div className="font-mono text-xs text-muted-foreground">
            {shortOrderId(order._id)}
          </div>
          <div className="truncate font-semibold">{order.customerName}</div>
        </Link>
        <div
          className={
            isLate
              ? "flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive"
              : "flex items-center gap-1 text-xs text-muted-foreground"
          }
          title={`Placed at ${formatTime(placedAt(order))}`}
        >
          <Clock className="size-3" />
          {isFinal
            ? formatTime(statusSince(order))
            : formatElapsed(statusSince(order), now)}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <ul className="space-y-1 text-sm">
          {order.items.map((item, i) => (
            <li key={i} className="flex justify-between gap-2">
              <span>
                <span className="font-semibold text-primary">
                  {item.quantity}×
                </span>{" "}
                {item.name}{" "}
                <span className="text-muted-foreground">
                  ({SIZE_LABEL[item.size]})
                </span>
              </span>
            </li>
          ))}
        </ul>
        {order.notes && (
          <p className="rounded-md bg-secondary px-2 py-1.5 text-xs text-secondary-foreground">
            “{order.notes}”
          </p>
        )}
        <div className="flex items-start justify-between gap-2 text-xs text-muted-foreground">
          <span className="flex min-w-0 items-start gap-1">
            <MapPin className="mt-0.5 size-3 shrink-0" />
            <span className="line-clamp-2">{order.address}</span>
          </span>
          <span className="shrink-0 font-semibold text-foreground">
            {formatPrice(order.total)}
          </span>
        </div>
      </CardContent>
      {!isFinal && (
        <CardFooter>
          <OrderActions order={order} className="w-full" />
        </CardFooter>
      )}
    </Card>
  );
}
