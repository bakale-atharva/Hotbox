# Hotbox — Backend

The [Convex](https://convex.dev) backend shared by the [customer app](../app/) and the [admin panel](../admin/). It holds the database schema and every query and mutation. Clients subscribe to live queries, so changes show up everywhere instantly.

## Commands

Run these from inside `backend/`.

| Command | What it does |
| --- | --- |
| `pnpm install` | Install dependencies |
| `pnpm dev` | Run `convex dev`: watch, deploy to your dev deployment and regenerate `convex/_generated/`. This is long-running. |
| `pnpm typecheck` | Typecheck `convex/` |
| `pnpm lint` | ESLint, including the Convex plugin rules |
| `pnpm seed` | Seed the menu (3 categories at positions 1–3, 15 ingredients, 8 pizzas). Safe to repeat; it skips if categories already exist. |
| `pnpm seed:orders` | Seed 32 demo orders dated **27–30 Sep 2026** (lunch and dinner times, IST by default). Most are delivered, 3 are cancelled and the last 3 are still in progress. Needs the menu first, and is safe to repeat. For a UTC store, run `pnpm exec convex run seed:orders '{utcOffsetMinutes: 0}'`. |

Use `pnpm exec convex <command>` for any other Convex CLI command. Never edit `convex/_generated/` by hand.

## Environment

`backend/.env.local` is created by `convex dev` and is not committed:

- `CONVEX_DEPLOYMENT`, `CONVEX_URL`, `CONVEX_SITE_URL`

Set this in the **Convex dashboard** (deployment env vars), not in a local file:

- `CLERK_FRONTEND_API_URL`: your Clerk Frontend API URL. [`convex/auth.config.ts`](convex/auth.config.ts) uses it to verify Clerk tokens.

## Data model

All money is stored as **integer cents**.

| Table | Fields |
| --- | --- |
| `categories` | `name`, `sortOrder` (1-based menu position) |
| `ingredients` | `name`, `inStock` |
| `pizzas` | `name`, `description`, `categoryId`, `ingredientIds`, `prices { small, medium, large }`, `imageId?` (Convex file storage), `isAvailable` |
| `orders` | `userId` (Clerk `tokenIdentifier`), `customerName`, `address`, `phone`, `notes?`, `items[]` (snapshot of name, size, unit price, quantity), `subtotal`, `deliveryFee`, `total`, `status`, `placedAt?`, `cookingAt?`, `outForDeliveryAt?`, `deliveredAt?`, `cancelledAt?` |

`placedAt` is set when an order is placed. It exists separately from `_creationTime`, which Convex controls, so seed data can carry real dates. Orders created before the field existed fall back to `_creationTime`.

Order items are a **snapshot**: editing or deleting a pizza later doesn't change past orders.

## Functions

| Module | Signed-in or public | Admin-only |
| --- | --- | --- |
| [`categories`](convex/categories.ts) | `list` | `create`, `update`, `remove` (blocked while pizzas use it) |
| [`ingredients`](convex/ingredients.ts) | `list` | `create`, `update` (incl. stock toggle), `remove` (blocked while used) |
| [`pizzas`](convex/pizzas.ts) | `listMenu`, `get` (with `imageUrl`, `ingredients` and computed `soldOut`) | `adminList`, `create`, `update`, `setAvailability`, `remove`, `generateUploadUrl` |
| [`orders`](convex/orders.ts) | `place`, `listMine`, `getMine`, `cancelMine` | `adminList({ status? })`, `adminGet`, `updateStatus` |
| [`viewer`](convex/viewer.ts) | `me` returns `{ name, email, isAdmin }` | |
| [`seed`](convex/seed.ts) | internal `run` | |

Shared helpers live in [`convex/lib/`](convex/lib/):

- `auth.ts`: `requireUser` and `requireAdmin`
- `orderFlow.ts`: delivery fee, limits and status transitions
- `validators.ts`: shared validators such as sizes, statuses and the order item
- `validate.ts`: input cleaning

## Business rules

- **Admins** are Clerk users with public metadata `{ "role": "admin" }`, sent in the token as a `metadata` claim. See the [root README](../README.md#admin-access) for the Clerk setup.
- **`orders.place`** takes only `{ pizzaId, size, quantity }` from the client. Names and prices are looked up on the server. It rejects empty carts, hidden or sold-out pizzas, more than 20 line items, and quantities outside 1–20.
- **Status transitions** go one step at a time: `pending → cooking → out_for_delivery → delivered`. Admins can cancel from `pending` or `cooking`; customers only from `pending`. Each transition records its timestamp.
- **Sold out**: a pizza is sold out when any of its ingredients has `inStock: false`.
- **Privacy**: customers can only read their own orders.
- The delivery fee is a flat **$2.99** (`DELIVERY_FEE` in `lib/orderFlow.ts`).

## Testing functions from the CLI

You can call functions as a mock user with `--identity`:

```bash
# Customer
pnpm exec convex run orders:listMine '{}' --identity "{subject:'u1',tokenIdentifier:'test|u1'}"

# Admin
pnpm exec convex run viewer:me '{}' --identity "{subject:'a1',tokenIdentifier:'test|a1',metadata:{role:'admin'}}"
```
