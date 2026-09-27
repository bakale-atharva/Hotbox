import { query } from "./_generated/server";
import { isAdminIdentity } from "./lib/auth";

/** Who the current caller is, as far as Convex can tell from their token. */
export const me = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    return {
      name: identity.name ?? null,
      email: identity.email ?? null,
      isAdmin: isAdminIdentity(identity),
    };
  },
});
