"use client";

import { api } from "@backend/convex/_generated/api";
import { useQuery } from "convex/react";
import { ChefHat, CircleDollarSign, Flame, ReceiptText } from "lucide-react";
import type { ReactNode } from "react";
import { OrderCard } from "@/components/orders/order-card";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useNow } from "@/hooks/use-now";
import { formatPrice } from "@/lib/format";
import {
  ORDER_STATUS,
  placedAt,
  type Order,
  type OrderStatus,
} from "@/lib/order-status";
import { cn } from "@/lib/utils";

const COLUMNS: { status: OrderStatus; empty: string }[] = [
  { status: "pending", empty: "No new orders. Waiting for hungry people…" },
  { status: "cooking", empty: "Nothing in the oven." },
  { status: "out_for_delivery", empty: "No drivers out." },
  { status: "delivered", empty: "Nothing delivered yet today." },
];

/** [start, end) of the local calendar day containing `now`. */
function todayRange(now: number) {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start: start.getTime(), end: end.getTime() };
}

const oldestFirst = (orders: Order[] | undefined) =>
  orders && [...orders].sort((a, b) => placedAt(a) - placedAt(b));

export default function OrdersBoardPage() {
  const now = useNow();
  const pending = useQuery(api.orders.adminList, { status: "pending" });
  const cooking = useQuery(api.orders.adminList, { status: "cooking" });
  const outForDelivery = useQuery(api.orders.adminList, {
    status: "out_for_delivery",
  });
  const delivered = useQuery(api.orders.adminList, { status: "delivered" });
  const recent = useQuery(api.orders.adminList, {});

  const today = todayRange(now);
  const isToday = (ms: number | undefined) =>
    ms !== undefined && ms >= today.start && ms < today.end;
  const byStatus: Partial<Record<OrderStatus, Order[] | undefined>> = {
    // Oldest first, so the kitchen works through the queue in order.
    pending: oldestFirst(pending),
    cooking: oldestFirst(cooking),
    out_for_delivery: oldestFirst(outForDelivery),
    delivered: delivered
      ?.filter((o) => isToday(o.deliveredAt))
      .sort((a, b) => (b.deliveredAt ?? 0) - (a.deliveredAt ?? 0)),
  };

  const todays = recent?.filter((o) => isToday(placedAt(o)));
  const revenue = todays
    ?.filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + o.total, 0);
  const active =
    pending && cooking && outForDelivery
      ? pending.length + cooking.length + outForDelivery.length
      : undefined;

  return (
    <>
      <PageHeader
        title="Orders"
        description="Live from the kitchen. New orders appear instantly."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          icon={<ReceiptText />}
          label="Orders today"
          value={todays?.length}
        />
        <Stat
          icon={<CircleDollarSign />}
          label="Revenue today"
          value={revenue === undefined ? undefined : formatPrice(revenue)}
        />
        <Stat icon={<Flame />} label="In progress" value={active} highlight />
        <Stat icon={<ChefHat />} label="In the oven" value={cooking?.length} />
      </div>

      <div className="grid flex-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {COLUMNS.map(({ status, empty }) => {
          const orders = byStatus[status];
          const meta = ORDER_STATUS[status];
          return (
            <section
              key={status}
              className="flex min-h-64 flex-col rounded-2xl border bg-muted/40"
            >
              <header className="flex items-center gap-2 px-4 pt-4 pb-3">
                <span
                  className={cn("size-2 rounded-full", meta.dotClassName)}
                />
                <h2 className="text-sm font-semibold">
                  {status === "delivered" ? "Delivered today" : meta.label}
                </h2>
                <span
                  className={cn(
                    "ml-auto rounded-full px-2 py-0.5 text-xs font-medium",
                    meta.badgeClassName,
                  )}
                >
                  {orders?.length ?? "–"}
                </span>
              </header>
              <ScrollArea className="flex-1 px-3 pb-3 xl:max-h-[calc(100svh-19rem)]">
                <div className="flex flex-col gap-3">
                  {orders === undefined ? (
                    <>
                      <Skeleton className="h-40 rounded-xl" />
                      <Skeleton className="h-40 rounded-xl" />
                    </>
                  ) : orders.length === 0 ? (
                    <p className="px-2 py-8 text-center text-sm text-muted-foreground">
                      {empty}
                    </p>
                  ) : (
                    orders.map((order) => (
                      <OrderCard key={order._id} order={order} now={now} />
                    ))
                  )}
                </div>
              </ScrollArea>
            </section>
          );
        })}
      </div>
    </>
  );
}

function Stat({
  icon,
  label,
  value,
  highlight,
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode | undefined;
  highlight?: boolean;
}) {
  return (
    <Card size="sm">
      <CardContent className="flex items-center gap-4">
        <div
          className={cn(
            "flex size-10 items-center justify-center rounded-xl [&_svg]:size-5",
            highlight
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground",
          )}
        >
          {icon}
        </div>
        <div>
          <div className="text-xs text-muted-foreground">{label}</div>
          {value === undefined ? (
            <Skeleton className="mt-1 h-6 w-16" />
          ) : (
            <div className="font-heading text-xl font-bold tabular-nums">
              {value}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
