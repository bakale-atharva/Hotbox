import type { Id } from "./_generated/dataModel";
import { internalMutation } from "./_generated/server";

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
