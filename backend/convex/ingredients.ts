import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin } from "./lib/auth";
import { cleanName } from "./lib/validate";

const MAX_INGREDIENTS = 500;

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("ingredients")
      .withIndex("by_name")
      .take(MAX_INGREDIENTS);
  },
});

export const create = mutation({
  args: { name: v.string(), inStock: v.boolean() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.insert("ingredients", {
      name: cleanName(args.name, "Ingredient name"),
      inStock: args.inStock,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("ingredients"),
    name: v.optional(v.string()),
    inStock: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch("ingredients", args.id, {
      ...(args.name !== undefined && {
        name: cleanName(args.name, "Ingredient name"),
      }),
      ...(args.inStock !== undefined && { inStock: args.inStock }),
    });
    return null;
  },
});

export const remove = mutation({
  args: { id: v.id("ingredients") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    // A single store's menu is small, so scanning pizzas is fine here.
    for await (const pizza of ctx.db.query("pizzas")) {
      if (pizza.ingredientIds.includes(args.id)) {
        throw new ConvexError(
          `"${pizza.name}" still uses this ingredient. Remove it from that pizza first.`,
        );
      }
    }
    await ctx.db.delete("ingredients", args.id);
    return null;
  },
});
