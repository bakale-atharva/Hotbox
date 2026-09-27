import { v, type Infer } from "convex/values";

export const pizzaSize = v.union(
  v.literal("small"),
  v.literal("medium"),
  v.literal("large"),
);
export type PizzaSize = Infer<typeof pizzaSize>;

export const orderStatus = v.union(
  v.literal("pending"),
  v.literal("cooking"),
  v.literal("out_for_delivery"),
  v.literal("delivered"),
  v.literal("cancelled"),
);
export type OrderStatus = Infer<typeof orderStatus>;

/** Prices per size, stored as integer cents. */
export const sizePrices = v.object({
  small: v.number(),
  medium: v.number(),
  large: v.number(),
});

/** Snapshot of a pizza at the moment it was ordered. */
export const orderItem = v.object({
  pizzaId: v.id("pizzas"),
  name: v.string(),
  size: pizzaSize,
  unitPrice: v.number(),
  quantity: v.number(),
});

export const pizzaFields = v.object({
  name: v.string(),
  description: v.string(),
  categoryId: v.id("categories"),
  ingredientIds: v.array(v.id("ingredients")),
  prices: sizePrices,
  imageId: v.optional(v.id("_storage")),
  isAvailable: v.boolean(),
});
