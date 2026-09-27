import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { orderItem, orderStatus, pizzaFields } from "./lib/validators";

export default defineSchema({
  categories: defineTable({
    name: v.string(),
    sortOrder: v.number(),
  }).index("by_sortOrder", ["sortOrder"]),

  ingredients: defineTable({
    name: v.string(),
    inStock: v.boolean(),
  }).index("by_name", ["name"]),

  pizzas: defineTable(pizzaFields)
    .index("by_categoryId", ["categoryId"])
    .index("by_isAvailable", ["isAvailable"]),

  orders: defineTable({
    // Clerk identity tokenIdentifier of the customer.
    userId: v.string(),
    customerName: v.string(),
    address: v.string(),
    phone: v.string(),
    notes: v.optional(v.string()),
    // Bounded: orders.place caps the number of line items.
    items: v.array(orderItem),
    subtotal: v.number(),
    deliveryFee: v.number(),
    total: v.number(),
    status: orderStatus,
    cookingAt: v.optional(v.number()),
    outForDeliveryAt: v.optional(v.number()),
    deliveredAt: v.optional(v.number()),
    cancelledAt: v.optional(v.number()),
  })
    .index("by_userId", ["userId"])
    .index("by_status", ["status"]),
});
