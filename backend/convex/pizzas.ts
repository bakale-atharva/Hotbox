import { ConvexError, v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import { mutation, query, type QueryCtx } from "./_generated/server";
import { requireAdmin } from "./lib/auth";
import { assertPriceCents, cleanName } from "./lib/validate";
import { pizzaFields } from "./lib/validators";

const MAX_PIZZAS = 200;
const MAX_INGREDIENTS = 500;

type IngredientMap = Map<Id<"ingredients">, Doc<"ingredients">>;

async function loadIngredientMap(ctx: QueryCtx): Promise<IngredientMap> {
  const ingredients = await ctx.db.query("ingredients").take(MAX_INGREDIENTS);
  return new Map(ingredients.map((i) => [i._id, i]));
}

/** A pizza is sold out when any of its ingredients is out of stock (or was deleted). */
export function isSoldOut(pizza: Doc<"pizzas">, ingredients: IngredientMap) {
  return pizza.ingredientIds.some((id) => !ingredients.get(id)?.inStock);
}

async function hydrate(
  ctx: QueryCtx,
  pizza: Doc<"pizzas">,
  ingredients: IngredientMap,
) {
  return {
    ...pizza,
    imageUrl: pizza.imageId ? await ctx.storage.getUrl(pizza.imageId) : null,
    ingredients: pizza.ingredientIds.flatMap((id) => {
      const ingredient = ingredients.get(id);
      return ingredient
        ? [{ _id: ingredient._id, name: ingredient.name, inStock: ingredient.inStock }]
        : [];
    }),
    soldOut: isSoldOut(pizza, ingredients),
  };
}

/** Customer menu: available pizzas only, with image URLs and sold-out state. */
export const listMenu = query({
  args: {},
  handler: async (ctx) => {
    const [pizzas, ingredients] = await Promise.all([
      ctx.db
        .query("pizzas")
        .withIndex("by_isAvailable", (q) => q.eq("isAvailable", true))
        .take(MAX_PIZZAS),
      loadIngredientMap(ctx),
    ]);
    return await Promise.all(pizzas.map((p) => hydrate(ctx, p, ingredients)));
  },
});

/** Single pizza for the customer detail screen. Hidden pizzas return null. */
export const get = query({
  args: { id: v.id("pizzas") },
  handler: async (ctx, args) => {
    const pizza = await ctx.db.get("pizzas", args.id);
    if (!pizza || !pizza.isAvailable) return null;
    return await hydrate(ctx, pizza, await loadIngredientMap(ctx));
  },
});

export const adminList = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const [pizzas, ingredients] = await Promise.all([
      ctx.db.query("pizzas").order("desc").take(MAX_PIZZAS),
      loadIngredientMap(ctx),
    ]);
    return await Promise.all(pizzas.map((p) => hydrate(ctx, p, ingredients)));
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

async function validatePizza(
  ctx: QueryCtx,
  fields: typeof pizzaFields.type,
): Promise<typeof pizzaFields.type> {
  assertPriceCents(fields.prices.small, "Small price");
  assertPriceCents(fields.prices.medium, "Medium price");
  assertPriceCents(fields.prices.large, "Large price");
  if (!(await ctx.db.get("categories", fields.categoryId))) {
    throw new ConvexError("Category not found.");
  }
  const ingredientIds = [...new Set(fields.ingredientIds)];
  for (const id of ingredientIds) {
    if (!(await ctx.db.get("ingredients", id))) {
      throw new ConvexError("One of the selected ingredients no longer exists.");
    }
  }
  return {
    ...fields,
    name: cleanName(fields.name, "Pizza name"),
    description: fields.description.trim(),
    ingredientIds,
  };
}

export const create = mutation({
  args: pizzaFields.fields,
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.insert("pizzas", await validatePizza(ctx, args));
  },
});

export const update = mutation({
  args: { id: v.id("pizzas"), ...pizzaFields.fields },
  handler: async (ctx, { id, ...fields }) => {
    await requireAdmin(ctx);
    const existing = await ctx.db.get("pizzas", id);
    if (!existing) throw new ConvexError("Pizza not found.");
    await ctx.db.replace("pizzas", id, await validatePizza(ctx, fields));
    if (existing.imageId && existing.imageId !== fields.imageId) {
      await ctx.storage.delete(existing.imageId);
    }
    return null;
  },
});

/** Quick toggle for the admin table without resubmitting the whole form. */
export const setAvailability = mutation({
  args: { id: v.id("pizzas"), isAvailable: v.boolean() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch("pizzas", args.id, { isAvailable: args.isAvailable });
    return null;
  },
});

export const remove = mutation({
  args: { id: v.id("pizzas") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const pizza = await ctx.db.get("pizzas", args.id);
    if (!pizza) return null;
    await ctx.db.delete("pizzas", args.id);
    if (pizza.imageId) await ctx.storage.delete(pizza.imageId);
    return null;
  },
});
