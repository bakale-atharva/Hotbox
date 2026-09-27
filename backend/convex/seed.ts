import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import { internalMutation } from "./_generated/server";
import { DELIVERY_FEE } from "./lib/orderFlow";
import type { PizzaSize } from "./lib/validators";

const CATEGORIES = ["Classics", "Meat Lovers", "Veggie"] as const;

const INGREDIENTS = [
  "Tomato sauce",
  "Mozzarella",
  "Basil",
  "Pepperoni",
  "Italian sausage",
  "Ham",
  "Bacon",
  "Mushrooms",
  "Red onion",
  "Green peppers",
  "Black olives",
  "Pineapple",
  "Jalapeños",
  "BBQ sauce",
  "Chicken",
] as const;

type Ingredient = (typeof INGREDIENTS)[number];

const PIZZAS: {
  name: string;
  description: string;
  category: (typeof CATEGORIES)[number];
  ingredients: Ingredient[];
  prices: { small: number; medium: number; large: number };
}[] = [
  {
    name: "Margherita",
    description: "San Marzano tomato, fresh mozzarella and basil. Simple and perfect.",
    category: "Classics",
    ingredients: ["Tomato sauce", "Mozzarella", "Basil"],
    prices: { small: 999, medium: 1299, large: 1599 },
  },
  {
    name: "Pepperoni",
    description: "Loaded with crispy-edged pepperoni cups over a classic cheese base.",
    category: "Classics",
    ingredients: ["Tomato sauce", "Mozzarella", "Pepperoni"],
    prices: { small: 1099, medium: 1399, large: 1699 },
  },
  {
    name: "Hawaiian",
    description: "Ham and pineapple. Controversial, delicious.",
    category: "Classics",
    ingredients: ["Tomato sauce", "Mozzarella", "Ham", "Pineapple"],
    prices: { small: 1099, medium: 1399, large: 1699 },
  },
  {
    name: "Meat Feast",
    description: "Pepperoni, sausage, ham and bacon for the truly hungry.",
    category: "Meat Lovers",
    ingredients: ["Tomato sauce", "Mozzarella", "Pepperoni", "Italian sausage", "Ham", "Bacon"],
    prices: { small: 1299, medium: 1599, large: 1999 },
  },
  {
    name: "BBQ Chicken",
    description: "Smoky BBQ base, grilled chicken, red onion and bacon.",
    category: "Meat Lovers",
    ingredients: ["BBQ sauce", "Mozzarella", "Chicken", "Red onion", "Bacon"],
    prices: { small: 1299, medium: 1599, large: 1899 },
  },
  {
    name: "Hot Box Special",
    description: "Our house favourite: pepperoni, sausage and jalapeños with a kick.",
    category: "Meat Lovers",
    ingredients: ["Tomato sauce", "Mozzarella", "Pepperoni", "Italian sausage", "Jalapeños"],
    prices: { small: 1299, medium: 1599, large: 1999 },
  },
  {
    name: "Garden Veggie",
    description: "Mushrooms, peppers, red onion and black olives.",
    category: "Veggie",
    ingredients: ["Tomato sauce", "Mozzarella", "Mushrooms", "Green peppers", "Red onion", "Black olives"],
    prices: { small: 1099, medium: 1399, large: 1699 },
  },
  {
    name: "Funghi",
    description: "A mountain of mushrooms with mozzarella and basil.",
    category: "Veggie",
    ingredients: ["Tomato sauce", "Mozzarella", "Mushrooms", "Basil"],
    prices: { small: 1049, medium: 1349, large: 1649 },
  },
];

/** Seed the menu. Run with: pnpm exec convex run seed:run */
export const run = internalMutation({
  args: {},
  handler: async (ctx) => {
    if (await ctx.db.query("categories").first()) {
      console.log("Menu already seeded; skipping.");
      return null;
    }

    const categoryIds = new Map<string, Id<"categories">>();
    for (const [sortOrder, name] of CATEGORIES.entries()) {
      categoryIds.set(name, await ctx.db.insert("categories", { name, sortOrder }));
    }

    const ingredientIds = new Map<string, Id<"ingredients">>();
    for (const name of INGREDIENTS) {
      ingredientIds.set(name, await ctx.db.insert("ingredients", { name, inStock: true }));
    }

    for (const pizza of PIZZAS) {
      await ctx.db.insert("pizzas", {
        name: pizza.name,
        description: pizza.description,
        categoryId: categoryIds.get(pizza.category)!,
        ingredientIds: pizza.ingredients.map((i) => ingredientIds.get(i)!),
        prices: pizza.prices,
        isAvailable: true,
      });
    }

    console.log(
      `Seeded ${CATEGORIES.length} categories, ${INGREDIENTS.length} ingredients, ${PIZZAS.length} pizzas.`,
    );
    return null;
  },
});

// ---------------------------------------------------------------------------
// Demo orders: 27–30 September 2026
// ---------------------------------------------------------------------------

const DEMO_USER_PREFIX = "seed|demo-customer-";

const DEMO_CUSTOMERS = [
  { name: "Aarav Sharma", phone: "+91 98200 11234", address: "12 Hill Road, Bandra West, Mumbai" },
  { name: "Priya Nair", phone: "+91 98921 55670", address: "Flat 4B, Sea Breeze Apts, Juhu, Mumbai" },
  { name: "Rohan Mehta", phone: "+91 99301 42210", address: "7 Carter Road, Khar West, Mumbai" },
  { name: "Ananya Iyer", phone: "+91 97690 88123", address: "21 Linking Road, Santacruz West, Mumbai" },
  { name: "Kabir Singh", phone: "+91 98195 30045", address: "3rd Floor, Palm Court, Andheri West, Mumbai" },
  { name: "Meera Joshi", phone: "+91 90040 67789", address: "9 Pali Hill, Bandra West, Mumbai" },
];

const DEMO_NOTES = [
  "Extra napkins please",
  "Ring the bell twice",
  "Leave at the gate",
  "Well done, extra crispy",
];

const DEMO_DAYS = [27, 28, 29, 30]; // September 2026
// Local times (hour, minute) for lunch and dinner rushes.
const DEMO_SLOTS: [number, number][] = [
  [12, 10], [12, 45], [13, 20], [18, 5], [18, 40], [19, 15], [19, 50], [20, 30],
];
const SIZES: PizzaSize[] = ["small", "medium", "large"];

/** Small deterministic PRNG so the demo data is the same on every run. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Seed demo orders placed between 27 and 30 September 2026 (store-local time).
 * Most are delivered, a few cancelled, and the last three of 30 Sep are still
 * in progress so the order board has live cards.
 *
 *   pnpm exec convex run seed:orders
 *   pnpm exec convex run seed:orders '{utcOffsetMinutes: 0}'   # UTC store
 *
 * Idempotent: skips if demo orders already exist. Needs the menu (seed:run).
 */
export const orders = internalMutation({
  args: {
    /** Store timezone as minutes ahead of UTC. Defaults to IST (+5:30). */
    utcOffsetMinutes: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const offsetMs = (args.utcOffsetMinutes ?? 330) * 60_000;

    const alreadySeeded = await ctx.db
      .query("orders")
      .withIndex("by_userId", (q) => q.eq("userId", `${DEMO_USER_PREFIX}0`))
      .first();
    if (alreadySeeded) {
      console.log("Demo orders already seeded; skipping.");
      return null;
    }

    const pizzas: Doc<"pizzas">[] = await ctx.db.query("pizzas").take(200);
    if (pizzas.length === 0) {
      throw new Error("No pizzas found. Run seed:run first.");
    }

    const random = mulberry32(20260927);
    const pick = <T>(list: readonly T[]) => list[Math.floor(random() * list.length)];
    const minutes = (min: number, max: number) =>
      (min + Math.floor(random() * (max - min + 1))) * 60_000;

    const totalOrders = DEMO_DAYS.length * DEMO_SLOTS.length;
    let index = 0;
    let cancelled = 0;

    // Insert in chronological order so _creationTime ordering matches placedAt.
    for (const day of DEMO_DAYS) {
      for (const [hour, minute] of DEMO_SLOTS) {
        const placedAt =
          Date.UTC(2026, 8, day, hour, minute) - offsetMs + minutes(0, 8);
        const customerIndex = index % DEMO_CUSTOMERS.length;
        const customer = DEMO_CUSTOMERS[customerIndex];

        const lineCount = 1 + Math.floor(random() * 3);
        const items: Doc<"orders">["items"] = [];
        for (let i = 0; i < lineCount; i++) {
          const pizza = pick(pizzas);
          const size = pick(SIZES);
          const existing = items.find((it) => it.pizzaId === pizza._id && it.size === size);
          if (existing) {
            existing.quantity += 1;
            continue;
          }
          items.push({
            pizzaId: pizza._id,
            name: pizza.name,
            size,
            unitPrice: pizza.prices[size],
            quantity: random() < 0.25 ? 2 : 1,
          });
        }
        const subtotal = items.reduce((sum, it) => sum + it.unitPrice * it.quantity, 0);

        // The final three orders stay in progress; every ninth is cancelled.
        const fromEnd = totalOrders - index;
        const cookingAt = placedAt + minutes(2, 6);
        const outForDeliveryAt = cookingAt + minutes(14, 22);
        const deliveredAt = outForDeliveryAt + minutes(12, 25);

        let timeline: Pick<
          Doc<"orders">,
          "status" | "cookingAt" | "outForDeliveryAt" | "deliveredAt" | "cancelledAt"
        >;
        if (fromEnd === 1) {
          timeline = { status: "pending" };
        } else if (fromEnd === 2) {
          timeline = { status: "cooking", cookingAt };
        } else if (fromEnd === 3) {
          timeline = { status: "out_for_delivery", cookingAt, outForDeliveryAt };
        } else if (index % 9 === 4) {
          timeline = { status: "cancelled", cancelledAt: placedAt + minutes(1, 4) };
          cancelled++;
        } else {
          timeline = { status: "delivered", cookingAt, outForDeliveryAt, deliveredAt };
        }

        const note = random() < 0.3 ? pick(DEMO_NOTES) : undefined;
        await ctx.db.insert("orders", {
          userId: `${DEMO_USER_PREFIX}${customerIndex}`,
          customerName: customer.name,
          address: customer.address,
          phone: customer.phone,
          ...(note ? { notes: note } : {}),
          items,
          subtotal,
          deliveryFee: DELIVERY_FEE,
          total: subtotal + DELIVERY_FEE,
          placedAt,
          ...timeline,
        });
        index++;
      }
    }

    console.log(
      `Seeded ${totalOrders} demo orders for 27–30 Sep 2026 (${cancelled} cancelled, 3 in progress).`,
    );
    return null;
  },
});
