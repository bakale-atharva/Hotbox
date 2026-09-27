"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { errorMessage } from "@/lib/errors";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-24 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle className="size-6" />
      </div>
      <div className="space-y-1">
        <h2 className="font-heading text-lg font-semibold">
          This page hit a problem
        </h2>
        <p className="max-w-md text-sm text-muted-foreground">
          {errorMessage(error)}
        </p>
      </div>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
