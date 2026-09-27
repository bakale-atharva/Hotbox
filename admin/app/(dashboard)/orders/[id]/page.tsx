"use client";

import { api } from "@backend/convex/_generated/api";
import type { Id } from "@backend/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { ArrowLeft, MapPin, NotebookPen, Phone } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { OrderActions } from "@/components/orders/order-actions";
import { StatusBadge } from "@/components/orders/status-badge";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime, formatPrice, shortOrderId } from "@/lib/format";
import {
  ORDER_STATUS,
  SIZE_LABEL,
  placedAt,
  type Order,
} from "@/lib/order-status";
import { cn } from "@/lib/utils";

const TIMELINE = [
  {
    status: "pending",
    label: "Order placed",
    at: (o: Order) => placedAt(o),
  },
  { status: "cooking", label: "Cooking", at: (o: Order) => o.cookingAt },
  {
    status: "out_for_delivery",
    label: "Out for delivery",
    at: (o: Order) => o.outForDeliveryAt,
  },
  { status: "delivered", label: "Delivered", at: (o: Order) => o.deliveredAt },
] as const;

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const order = useQuery(api.orders.adminGet, { id: id as Id<"orders"> });

  const back = (
    <Button variant="ghost" size="sm" asChild className="-ml-2 w-fit">
      <Link href="/">
        <ArrowLeft /> Back to orders
      </Link>
    </Button>
  );

  if (order === undefined) {
    return (
      <>
        {back}
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-80 rounded-xl lg:col-span-2" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </>
    );
  }

  if (order === null) {
    return (
      <>
        {back}
        <PageHeader
          title="Order not found"
          description="It may have been removed."
        />
      </>
    );
  }

  return (
    <>
      {back}
      <PageHeader
        title={
          <span className="flex items-center gap-3">
            Order {shortOrderId(order._id)}{" "}
            <StatusBadge status={order.status} />
          </span>
        }
        description={`Placed ${formatDateTime(placedAt(order))} by ${order.customerName}`}
        actions={<OrderActions order={order} size="default" />}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="divide-y">
              {order.items.map((item, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between gap-4 py-3 first:pt-0"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex size-9 items-center justify-center rounded-lg bg-secondary font-semibold text-secondary-foreground">
                      {item.quantity}×
                    </span>
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs text-muted-foreground">
                        Size {SIZE_LABEL[item.size]} ·{" "}
                        {formatPrice(item.unitPrice)} each
                      </div>
                    </div>
                  </div>
                  <span className="font-medium tabular-nums">
                    {formatPrice(item.unitPrice * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>
            <Separator />
            <dl className="space-y-1.5 text-sm">
              <Row label="Subtotal" value={formatPrice(order.subtotal)} />
              <Row label="Delivery" value={formatPrice(order.deliveryFee)} />
              <Row
                label="Total (cash on delivery)"
                value={formatPrice(order.total)}
                strong
              />
            </dl>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Delivery</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <Detail icon={<MapPin />}>{order.address}</Detail>
              <Detail icon={<Phone />}>
                <a href={`tel:${order.phone}`} className="hover:underline">
                  {order.phone}
                </a>
              </Detail>
              {order.notes && (
                <Detail icon={<NotebookPen />}>{order.notes}</Detail>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="relative space-y-5 border-l pl-5">
                {TIMELINE.map((step) => {
                  const at = step.at(order);
                  const done = at !== undefined;
                  return (
                    <li key={step.status} className="relative">
                      <span
                        className={cn(
                          "absolute top-1 -left-[1.6rem] size-3 rounded-full border-2 border-background",
                          done
                            ? ORDER_STATUS[step.status].dotClassName
                            : "bg-muted",
                        )}
                      />
                      <div
                        className={cn(
                          "text-sm font-medium",
                          !done && "text-muted-foreground",
                        )}
                      >
                        {step.label}
                      </div>
                      {done && (
                        <div className="text-xs text-muted-foreground">
                          {formatDateTime(at)}
                        </div>
                      )}
                    </li>
                  );
                })}
                {order.cancelledAt && (
                  <li className="relative">
                    <span className="absolute top-1 -left-[1.6rem] size-3 rounded-full border-2 border-background bg-status-cancelled" />
                    <div className="text-sm font-medium">Cancelled</div>
                    <div className="text-xs text-muted-foreground">
                      {formatDateTime(order.cancelledAt)}
                    </div>
                  </li>
                )}
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

function Row({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex justify-between",
        strong ? "text-base font-semibold" : "text-muted-foreground",
      )}
    >
      <dt>{label}</dt>
      <dd className="tabular-nums">{value}</dd>
    </div>
  );
}

function Detail({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-2 [&>svg]:mt-0.5 [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-muted-foreground">
      {icon}
      <div className="min-w-0 break-words">{children}</div>
    </div>
  );
}
