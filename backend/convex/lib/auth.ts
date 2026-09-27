import type { UserIdentity } from "convex/server";
import { ConvexError } from "convex/values";
import type { QueryCtx } from "../_generated/server";

/**
 * Admins are marked in the Clerk Dashboard with public metadata
 * `{ "role": "admin" }`. That metadata reaches Convex through a
 * `"metadata": "{{user.public_metadata}}"` claim on the Clerk token
 * (session token customization, or the `convex` JWT template).
 */
export function isAdminIdentity(identity: UserIdentity | null): boolean {
  if (!identity) return false;
  const metadata = identity.metadata;
  return (
    typeof metadata === "object" &&
    metadata !== null &&
    "role" in metadata &&
    metadata.role === "admin"
  );
}

export async function requireUser(ctx: QueryCtx): Promise<UserIdentity> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new ConvexError("You must be signed in.");
  }
  return identity;
}

export async function requireAdmin(ctx: QueryCtx): Promise<UserIdentity> {
  const identity = await requireUser(ctx);
  if (!isAdminIdentity(identity)) {
    throw new ConvexError("Admin access required.");
  }
  return identity;
}
