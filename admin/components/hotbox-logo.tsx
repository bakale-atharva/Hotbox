import { cn } from "@/lib/utils";

export function HotboxLogo({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 font-heading font-bold",
        className,
      )}
    >
      <span
        aria-hidden
        className="flex size-[1.6em] items-center justify-center rounded-[0.45em] bg-primary text-[0.9em] text-primary-foreground"
      >
        🍕
      </span>
      <span>
        Hot<span className="text-primary">box</span>
      </span>
    </div>
  );
}
