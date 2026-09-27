import { ConvexError, v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import { mutation, query, type MutationCtx } from "./_generated/server";
import { requireAdmin, requireUser } from "./lib/auth";
import {
  ADMIN_CANCELLABLE,
  CUSTOMER_CANCELLABLE,
  DELIVERY_FEE,
  MAX_LINE_ITEMS,
  MAX_QUANTITY_PER_ITEM,
  NEXT_STATUS,
  STATUS_TIMESTAMP_FIELD,
} from "./lib/orderFlow";
import { cleanName } from "./lib/validate";
import { orderStatus, pizzaSize, type OrderStatus } from "./lib/validators";
import { isSoldOut } from "./pizzas";

const MAX_ORDERS_PER_PAGE = 100;

/**
 * Place a cash-on-delivery order. The client only sends what it wants;
 * names and prices are looked up here so they can't be tampered with.
 */
export const place = mutation({
  args: {
    items: v.array(
      v.object({
        pizzaId: v.id("pizzas"),
        size: pizzaSize,
        quantity: v.number(),
      }),
    ),
    address: v.string(),
    phone: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await requireUser(ctx);

    if (args.items.length === 0) {
      throw new ConvexError("Your cart is empty.");
    }
    if (args.items.length > MAX_LINE_ITEMS) {
      throw new ConvexError(`Orders are limited to ${MAX_LINE_ITEMS} line items.`);
    }

    const ingredients = new Map(
      (await ctx.db.query("ingredients").take(500)).map((i) => [i._id, i]),
    );

    const items: Doc<"orders">["items"] = [];
    for (const line of args.items) {
      if (
        !Number.isInteger(line.quantity) ||
        line.quantity < 1 ||
        line.quantity > MAX_QUANTITY_PER_ITEM
      ) {
        throw new ConvexError(
          `Quantity must be between 1 and ${MAX_QUANTITY_PER_ITEM}.`,
        );
      }
      const pizza = await ctx.db.get("pizzas", line.pizzaId);
      if (!pizza || !pizza.isAvailable) {
        throw new ConvexError("A pizza in your cart is no longer on the menu.");
      }
      if (isSoldOut(pizza, ingredients)) {
        throw new ConvexError(`Sorry, "${pizza.name}" is sold out right now.`);
      }
      items.push({
        pizzaId: pizza._id,
        name: pizza.name,
        size: line.size,
        unitPrice: pizza.prices[line.size],
        quantity: line.quantity,
      });
    }

    const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
    const notes = args.notes?.trim();

    return await ctx.db.insert("orders", {
      userId: identity.tokenIdentifier,
      customerName: identity.name ?? identity.email ?? "Customer",
      address: cleanName(args.address, "Delivery address", 300),
      phone: cleanName(args.phone, "Phone number", 30),
      ...(notes ? { notes: notes.slice(0, 500) } : {}),
      items,
      subtotal,
      deliveryFee: DELIVERY_FEE,
      total: subtotal + DELIVERY_FEE,
      status: "pending",
      placedAt: Date.now(),
    });
  },
});

/** The signed-in customer's orders, newest first. */
export const listMine = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    return await ctx.db
      .query("orders")
      .withIndex("by_userId", (q) => q.eq("userId", identity.tokenIdentifier))
      .order("desc")
      .take(MAX_ORDERS_PER_PAGE);
  },
});

export const getMine = query({
  args: { id: v.id("orders") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const order = await ctx.db.get("orders", args.id);
    if (!order || order.userId !== identity.tokenIdentifier) return null;
    return order;
  },
});

export const cancelMine = mutation({
  args: { id: v.id("orders") },
  handler: async (ctx, args) => {
    const identity = await requireUser(ctx);
    const order = await ctx.db.get("orders", args.id);
    if (!order || order.userId !== identity.tokenIdentifier) {
      throw new ConvexError("Order not found.");
    }
    if (!CUSTOMER_CANCELLABLE.includes(order.status)) {
      throw new ConvexError("This order is already being prepared and can't be cancelled.");
    }
    await setStatus(ctx, order._id, "cancelled");
    return null;
  },
});

/** Admin: orders newest first, optionally filtered by status. */
export const adminList = query({
  args: { status: v.optional(orderStatus) },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const { status } = args;
    const orders =
      status === undefined
        ? ctx.db.query("orders")
        : ctx.db
            .query("orders")
            .withIndex("by_status", (q) => q.eq("status", status));
    return await orders.order("desc").take(MAX_ORDERS_PER_PAGE);
  },
});

export const adminGet = query({
  args: { id: v.id("orders") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.get("orders", args.id);
  },
});

/** Admin: advance an order one step, or cancel it before it leaves the store. */
export const updateStatus = mutation({
  args: { id: v.id("orders"), status: orderStatus },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const order = await ctx.db.get("orders", args.id);
    if (!order) throw new ConvexError("Order not found.");

    const { status } = args;
    const allowed =
      status === "cancelled"
        ? ADMIN_CANCELLABLE.includes(order.status)
        : NEXT_STATUS[order.status] === status;
    if (!allowed || status === "pending") {
      throw new ConvexError(
        `Can't move an order from "${order.status}" to "${status}".`,
      );
    }
    await setStatus(ctx, order._id, status);
    return null;
  },
});

async function setStatus(
  ctx: MutationCtx,
  id: Id<"orders">,
  status: Exclude<OrderStatus, "pending">,
) {
  await ctx.db.patch("orders", id, {
    status,
    [STATUS_TIMESTAMP_FIELD[status]]: Date.now(),
  });
}
