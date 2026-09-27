import { ConvexError, v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { mutation, query, type MutationCtx } from "./_generated/server";
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

/**
 * Keep menu positions unique and gap-free (1, 2, 3, …). Moves `id` to
 * `position` (clamped to the valid range, or last if omitted) and shifts the
 * other categories around it. Pass `id: null` to just close gaps.
 */
async function reorder(
  ctx: MutationCtx,
  id: Id<"categories"> | null,
  position?: number,
) {
  const all = await ctx.db
    .query("categories")
    .withIndex("by_sortOrder")
    .take(MAX_CATEGORIES);
  const ordered = all.filter((c) => c._id !== id).map((c) => c._id);
  if (id !== null) {
    const index = Math.min(
      Math.max((position ?? ordered.length + 1) - 1, 0),
      ordered.length,
    );
    ordered.splice(index, 0, id);
  }
  const current = new Map(all.map((c) => [c._id, c.sortOrder]));
  for (const [index, categoryId] of ordered.entries()) {
    if (current.get(categoryId) !== index + 1) {
      await ctx.db.patch("categories", categoryId, { sortOrder: index + 1 });
    }
  }
}

export const create = mutation({
  args: { name: v.string(), sortOrder: v.number() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    assertSortOrder(args.sortOrder);
    const count = (
      await ctx.db.query("categories").take(MAX_CATEGORIES)
    ).length;
    if (count >= MAX_CATEGORIES) {
      throw new ConvexError(`You can have at most ${MAX_CATEGORIES} categories.`);
    }
    const id = await ctx.db.insert("categories", {
      name: cleanName(args.name, "Category name"),
      sortOrder: args.sortOrder,
    });
    await reorder(ctx, id, args.sortOrder);
    return id;
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
    });
    await reorder(ctx, args.id, args.sortOrder);
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
    await reorder(ctx, null);
    return null;
  },
});
