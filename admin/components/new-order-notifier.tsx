"use client";

import { api } from "@backend/convex/_generated/api";
import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { formatPrice, shortOrderId } from "@/lib/format";

/** Pops a toast whenever a new pending order streams in from Convex. */
export function NewOrderNotifier() {
  const router = useRouter();
  const pending = useQuery(api.orders.adminList, { status: "pending" });
  const seen = useRef<Set<string> | null>(null);

  useEffect(() => {
    if (!pending) return;
    // First load: remember what's already there without notifying.
    if (seen.current === null) {
      seen.current = new Set(pending.map((o) => o._id));
      return;
    }
    for (const order of pending) {
      if (seen.current.has(order._id)) continue;
      seen.current.add(order._id);
      const count = order.items.reduce((n, i) => n + i.quantity, 0);
      toast.success(`New order ${shortOrderId(order._id)}`, {
        description: `${order.customerName} · ${count} pizza${count === 1 ? "" : "s"} · ${formatPrice(order.total)}`,
        action: {
          label: "View",
          onClick: () => router.push(`/orders/${order._id}`),
        },
      });
    }
  }, [pending, router]);

  return null;
}
