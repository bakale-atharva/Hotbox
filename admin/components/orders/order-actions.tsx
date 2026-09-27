"use client";

import { api } from "@backend/convex/_generated/api";
import { useMutation } from "convex/react";
import { ArrowRight, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { errorMessage } from "@/lib/errors";
import { shortOrderId } from "@/lib/format";
import { ORDER_STATUS, type Order, type OrderStatus } from "@/lib/order-status";
import { cn } from "@/lib/utils";

export function OrderActions({
  order,
  size = "sm",
  className,
}: {
  order: Order;
  size?: "sm" | "default";
  className?: string;
}) {
  const updateStatus = useMutation(api.orders.updateStatus);
  const [busy, setBusy] = useState(false);
  const meta = ORDER_STATUS[order.status];

  async function moveTo(status: OrderStatus) {
    setBusy(true);
    try {
      await updateStatus({ id: order._id, status });
      toast.success(
        `${shortOrderId(order._id)} → ${ORDER_STATUS[status].label}`,
      );
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  if (!meta.next && !meta.canCancel) return null;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {meta.next && (
        <Button
          size={size}
          className="flex-1"
          disabled={busy}
          onClick={() => moveTo(meta.next!.status)}
        >
          {meta.next.action}
          <ArrowRight data-icon="inline-end" />
        </Button>
      )}
      {meta.canCancel && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              size={size}
              variant="ghost"
              disabled={busy}
              aria-label="Cancel order"
            >
              <X />
              {size === "default" && "Cancel order"}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Cancel order {shortOrderId(order._id)}?
              </AlertDialogTitle>
              <AlertDialogDescription>
                {order.customerName} will see this order as cancelled. This
                can&apos;t be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep order</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                onClick={() => moveTo("cancelled")}
              >
                Cancel order
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
