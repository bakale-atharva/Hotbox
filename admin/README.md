# Hotbox — Admin Panel

The staff dashboard for Hotbox, built with Next.js (App Router), [Clerk](https://clerk.com), Tailwind CSS v4 and [shadcn/ui](https://ui.shadcn.com). It reads and writes the shared [Convex backend](../backend/) through live queries, so new orders appear without a refresh.

## Features

| Page | What you can do |
| --- | --- |
| **Orders** (`/`) | A live board with Pending, Cooking, Out for delivery and Delivered today columns. Advance an order with one click, or cancel it after confirming. Stat cards show today's orders, revenue and active orders. A timer turns red when an order has sat in one step for 20 minutes. |
| **Order detail** (`/orders/[id]`) | Items, totals, delivery details (tap the phone number to call) and a status timeline. |
| **Pizzas** (`/pizzas`) | Create, edit and delete pizzas: photo upload to Convex storage, category, ingredients, S/M/L prices and a menu visibility toggle. A **Sold out** badge appears when an ingredient runs out. |
| **Ingredients** (`/ingredients`) | Search ingredients and toggle stock inline. Turning one off immediately marks every pizza that uses it as sold out. |
| **Categories** (`/categories`) | Create, edit and delete categories and set their menu position (1, 2, 3, …). Deleting is blocked while pizzas still use the category. |

Also included:

- A **toast for every new order**, whichever page you're on, plus a pending-orders count in the sidebar.
- **Light, dark and system themes**.
- A collapsible sidebar.

## Access control

1. **`requireAdmin()`** (`lib/auth.ts`), called by the `(dashboard)` layout that wraps every admin page, requires a signed-in user whose session token has `metadata.role === "admin"`. Signed-out users are sent to `/sign-in`, and non-admins to `/unauthorized`. `proxy.ts` only runs `clerkMiddleware()` to attach auth state, following Clerk's move away from the deprecated `createRouteMatcher()` to per-resource checks.
2. **`/unauthorized`** shows a checklist of what the token actually contains (signed in, `metadata` claim present, role value), so a Clerk setup mistake is easy to spot.
3. **`AdminGate`** (`components/admin-gate.tsx`) waits until Convex has the Clerk token, then confirms Convex sees the admin role before any admin query runs.
4. **Convex** re-checks the role on every admin function. This is the real security boundary.

See the [root README](../README.md#admin-access) for the Clerk Dashboard setup.

## Design tokens

Admin and the Expo app share one Hotbox look. Colors are defined as CSS variables in [`app/globals.css`](app/globals.css), and the Expo app mirrors the same hex values.

| Token | Light | Dark | Used for |
| --- | --- | --- | --- |
| `primary` | `#e4572e` | `#f06a40` | Brand (tomato red), primary buttons |
| `background` | `#fffaf5` | `#12100e` | Warm off-white / near-black |
| `secondary` / `accent` | `#fdeee6` | `#2a211c` | Soft tomato tint |
| `status-pending` | `#d97706` | `#fbbf24` | Pending orders |
| `status-cooking` | `#e4572e` | `#f06a40` | Cooking |
| `status-out-for-delivery` | `#2563eb` | `#60a5fa` | Out for delivery |
| `status-delivered` | `#16a34a` | `#4ade80` | Delivered |
| `status-cancelled` | `#78716c` | `#a8a29e` | Cancelled |

The radius is `0.875rem`, and the font is Geist.

## Commands

Run these from inside `admin/`. The Convex backend runs separately (`cd ../backend && pnpm dev`).

| Command | What it does |
| --- | --- |
| `pnpm install` | Install dependencies |
| `pnpm dev` | Start the Next.js dev server at http://localhost:3000 |
| `pnpm typecheck` | Typecheck with TypeScript |
| `pnpm lint` | ESLint 10 with the Next.js config |
| `pnpm build` | Typecheck, then run a production build |

## Environment

`admin/.env.local` is not committed:

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_CONVEX_URL` | Convex deployment URL, used by `components/ConvexClientProvider.tsx` |
| `NEXT_PUBLIC_CONVEX_SITE_URL` | Convex HTTP actions URL |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `CLERK_SECRET_KEY` | Clerk secret key, server-side only |
| `CLERK_FRONTEND_API_URL` | Clerk Frontend API URL. It must also be set in the Convex dashboard. |

## How it's wired

- **Convex API types** are imported from the backend through a path alias: `import { api } from "@backend/convex/_generated/api"`. The alias `@backend/*` points to `../backend/*` in `tsconfig.json`. `turbopack.root` in `next.config.ts` points to the repo root so Next.js can resolve files outside `admin/`.
- **Auth**: `ClerkProvider` in `app/layout.tsx`, and `ConvexProviderWithClerk` in `components/ConvexClientProvider.tsx`. `proxy.ts` (Next 16's replacement for `middleware.ts`) runs `clerkMiddleware()`, and the admin check lives in `lib/auth.ts`. The session claim types are in `types/globals.d.ts`.
- **UI**: shadcn/ui (Radix base, Nova preset) lives in `components/ui/`; add more with `pnpm dlx shadcn@latest add <name>`. Icons come from `lucide-react`, and toasts use `sonner`.

## Structure

```
app/
  (dashboard)/        Admin-only pages sharing the sidebar layout
    page.tsx          Orders board
    orders/[id]/      Order detail
    pizzas/  ingredients/  categories/
  sign-in/            Clerk <SignIn />
  unauthorized/       Non-admin landing page with a token checklist
components/
  ui/                 shadcn/ui primitives
  orders/  pizzas/    Feature components
lib/                  Formatting, order status metadata, error helpers
lib/auth.ts           requireAdmin(), the per-resource admin check
proxy.ts              clerkMiddleware(): attaches auth state
```

## TypeScript 7 and linting

`pnpm typecheck` uses **TypeScript 7** through the `@typescript/native` alias (its `tsc` bin). typescript-eslint doesn't support TS 7 yet, so the `typescript` package that tooling loads is the **TS 6 API** (`npm:@typescript/typescript6`, which ships a `tsc6` bin, so it doesn't clash). A pnpm override in `pnpm-workspace.yaml` forces TS 6 for the transitive packages too.

`eslint.config.mjs` also pins `settings.react.version`. eslint-config-next's `"detect"` makes eslint-plugin-react call an API that ESLint 10 removed. Keep the pinned version in sync with the installed React.

Undo both workarounds once [typescript-eslint supports TS 7](https://github.com/typescript-eslint/typescript-eslint/issues/10940) and eslint-plugin-react supports ESLint 10.
