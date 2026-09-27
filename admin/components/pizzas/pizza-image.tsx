import Image from "next/image";
import { cn } from "@/lib/utils";

/** Pizza photo, or a branded placeholder when none has been uploaded yet. */
export function PizzaImage({
  src,
  alt,
  className,
}: {
  src: string | null | undefined;
  alt: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-lg bg-secondary",
        className,
      )}
    >
      {src ? (
        // Convex storage and local blob: previews; skip Next's optimizer.
        <Image src={src} alt={alt} fill unoptimized className="object-cover" />
      ) : (
        <span aria-hidden className="text-[length:min(2rem,50%)]">
          🍕
        </span>
      )}
    </div>
  );
}
