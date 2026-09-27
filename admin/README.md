# Hotbox — Admin Panel

The staff dashboard for Hotbox, built with Next.js (App Router), [Clerk](https://clerk.com) and Tailwind CSS v4. It reads and writes the shared [Convex backend](../backend/) through live queries, so new orders appear without a refresh.

> **Status:** the dashboard is built in **Phase 2**. For now the home page is a placeholder.

## Planned features (Phase 2)

- **Live order board**: Pending, Cooking, Out for delivery and Delivered columns. Advance or cancel an order with one click, and get a toast when a new order arrives.
- **Pizzas**: create, edit and delete pizzas, with S/M/L prices, category, ingredients, image upload and an availability toggle.
- **Ingredients**: manage stock. Marking one out of stock marks every pizza that uses it as sold out.
- **Categories**: manage categories and their order.
- **Admin-only access**: non-admins are redirected away. Convex also checks the admin role on every admin function.

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
- **Auth**: `ClerkProvider` in `app/layout.tsx`, and `ConvexProviderWithClerk` in `components/ConvexClientProvider.tsx`. Route protection lives in `proxy.ts` (Next 16's replacement for `middleware.ts`).
- **Admin role**: set `{ "role": "admin" }` in a user's Clerk public metadata. See the [root README](../README.md#admin-access).

## TypeScript 7 and linting

`pnpm typecheck` uses **TypeScript 7** through the `@typescript/native` alias (its `tsc` bin). typescript-eslint doesn't support TS 7 yet, so the `typescript` package that tooling loads is the **TS 6 API** (`npm:@typescript/typescript6`, which ships a `tsc6` bin, so it doesn't clash). A pnpm override in `pnpm-workspace.yaml` forces TS 6 for the transitive packages too.

`eslint.config.mjs` also pins `settings.react.version`. eslint-config-next's `"detect"` makes eslint-plugin-react call an API that ESLint 10 removed. Keep the pinned version in sync with the installed React.

Undo both workarounds once [typescript-eslint supports TS 7](https://github.com/typescript-eslint/typescript-eslint/issues/10940) and eslint-plugin-react supports ESLint 10.
