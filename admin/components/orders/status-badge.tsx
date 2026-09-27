import { Badge } from "@/components/ui/badge";
import { ORDER_STATUS, type OrderStatus } from "@/lib/order-status";
import { cn } from "@/lib/utils";

export function StatusBadge({
  status,
  className,
}: {
  status: OrderStatus;
  className?: string;
}) {
  const meta = ORDER_STATUS[status];
  return (
    <Badge
      variant="secondary"
      className={cn("gap-1.5 border-0", meta.badgeClassName, className)}
    >
      <span className={cn("size-1.5 rounded-full", meta.dotClassName)} />
      {meta.label}
    </Badge>
  );
}
