"use client";

import { api } from "@backend/convex/_generated/api";
import { SignOutButton } from "@clerk/nextjs";
import { useConvexAuth, useQuery } from "convex/react";
import { Loader2, ShieldAlert } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/**
 * The proxy already checked the admin role on the Next.js side. This waits
 * until Convex has the Clerk token too, and confirms Convex sees the same
 * role claim, so admin-only queries never fire unauthenticated.
 */
export function AdminGate({ children }: { children: ReactNode }) {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const viewer = useQuery(api.viewer.me, isAuthenticated ? {} : "skip");

  if (isLoading || (isAuthenticated && viewer === undefined)) {
    return (
      <div className="flex min-h-svh items-center justify-center text-muted-foreground">
        <Loader2 className="size-6 animate-spin" />
      </div>
    );
  }

  if (!viewer?.isAdmin) {
    return (
      <div className="flex min-h-svh items-center justify-center p-6">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <div className="mb-2 flex size-11 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <ShieldAlert className="size-5" />
            </div>
            <CardTitle>Convex doesn&apos;t see your admin role</CardTitle>
            <CardDescription className="space-y-2">
              <span className="block">
                {isAuthenticated
                  ? "Your Clerk session says you're an admin, but the token sent to Convex has no admin role claim."
                  : "Convex couldn't authenticate your Clerk session."}
              </span>
              <span className="block">
                In the Clerk Dashboard, add{" "}
                <code className="font-mono">{`"metadata": "{{user.public_metadata}}"`}</code>{" "}
                to the session token (and to the{" "}
                <code className="font-mono">convex</code> JWT template if you
                use one), then sign in again.
              </span>
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <SignOutButton redirectUrl="/sign-in">
              <Button variant="outline">Sign out</Button>
            </SignOutButton>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return children;
}
