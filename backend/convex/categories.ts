import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin } from "./lib/auth";
import { assertSortOrder, cleanName } from "./lib/validate";

const MAX_CATEGORIES = 100;

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("categories")
      .withIndex("by_sortOrder")
      .take(MAX_CATEGORIES);
  },
});

export const create = mutation({
  args: { name: v.string(), sortOrder: v.number() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    assertSortOrder(args.sortOrder);
    return await ctx.db.insert("categories", {
      name: cleanName(args.name, "Category name"),
      sortOrder: args.sortOrder,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("categories"),
    name: v.string(),
    sortOrder: v.number(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    assertSortOrder(args.sortOrder);
    await ctx.db.patch("categories", args.id, {
      name: cleanName(args.name, "Category name"),
      sortOrder: args.sortOrder,
    });
    return null;
  },
});

export const remove = mutation({
  args: { id: v.id("categories") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const inUse = await ctx.db
      .query("pizzas")
      .withIndex("by_categoryId", (q) => q.eq("categoryId", args.id))
      .first();
    if (inUse) {
      throw new ConvexError(
        "This category still has pizzas. Move or delete them first.",
      );
    }
    await ctx.db.delete("categories", args.id);
    return null;
  },
});
