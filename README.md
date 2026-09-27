# 🍕 Hotbox

A pizza delivery app for a single store, **Hotbox**. Customers order from a mobile app, and staff run the kitchen from a web admin panel. Both share one [Convex](https://convex.dev) backend, so orders and status changes stream between them in real time.

> Vibe-coded with Claude, inspired by Sonny Sangha.

## How it fits together

```
┌──────────────────────┐        ┌──────────────────────┐
│  app/   (Expo)       │        │  admin/   (Next.js)  │
│  Customers: browse,  │        │  Staff: menu, stock, │
│  cart, order, track  │        │  order board         │
└──────────┬───────────┘        └───────────┬──────────┘
           │   Convex React client (live queries)   │
           └──────────────┬─────────────────────────┘
                          ▼
              ┌──────────────────────┐
              │  backend/  (Convex)  │
              │  schema + functions  │
              └──────────┬───────────┘
                         │ verifies JWTs
                         ▼
                      Clerk (auth, admin role)
```

| Folder | What it is | Stack | Docs |
| --- | --- | --- | --- |
| [`app/`](app/) | Customer mobile app (iOS, Android, web) | Expo SDK 57, React Native, Expo Router | [app/README.md](app/README.md) |
| [`admin/`](admin/) | Admin dashboard | Next.js 16, Clerk, Tailwind CSS v4 | [admin/README.md](admin/README.md) |
| [`backend/`](backend/) | Shared database and server functions | Convex | [backend/README.md](backend/README.md) |

The repo is a **pnpm workspace managed by [Turborepo](https://turborepo.dev)**. The three packages (`@hotbox/app`, `@hotbox/admin`, `@hotbox/backend`) share one root lockfile, and `pnpm dev` at the root starts all of them together.

## Order lifecycle

```
pending ──▶ cooking ──▶ out_for_delivery ──▶ delivered
   │           │
   └───────────┴──▶ cancelled
```

- Customers place cash-on-delivery orders and can cancel only while an order is `pending`.
- Admins advance an order one step at a time, and can cancel it until it leaves the store.
- A pizza shows as **sold out** automatically when any of its ingredients is out of stock.

## Getting started

**Prerequisites:** Node.js, [pnpm](https://pnpm.io), a [Convex](https://convex.dev) account and a [Clerk](https://clerk.com) application.

1. **Install** everything from the repo root:
   ```bash
   pnpm install
   ```
2. **Configure env vars.** Each project has its own `.env.local` (see each README), and none of them are committed.
3. **Run everything** from the root. This starts Convex (`backend`), Next.js on http://localhost:3000 (`admin`) and Expo web on http://localhost:8081 (`app`) in Turborepo's terminal UI. Use the arrow keys to switch tasks, `i` to type into one (e.g. Expo shortcuts), and `Ctrl+Z` to stop typing into it:
   ```bash
   pnpm dev
   ```
   To run one package only: `pnpm turbo dev --filter=@hotbox/admin`.
4. **Seed the menu**, and optionally demo orders for 27–30 Sep 2026 (both are safe to run more than once):
   ```bash
   cd backend && pnpm seed
   pnpm seed:orders
   ```
5. For native builds, run `pnpm start`, `pnpm android` or `pnpm ios` from `app/`.

## Admin access

Only admins can use the admin panel and the admin functions. To make someone an admin:

1. **Clerk Dashboard → Sessions → Customize session token**: add
   ```json
   { "metadata": "{{user.public_metadata}}" }
   ```
2. **Clerk Dashboard → Users → (user) → Metadata → Public**: set
   ```json
   { "role": "admin" }
   ```
3. Have that user sign out and back in.

Convex checks this claim on every admin function, so the check is enforced on the server, not just in the UI. If an admin still gets bounced, the `/unauthorized` page lists which part of the token is missing.

## Conventions

- **pnpm only.** Never commit a `package-lock.json` or `yarn.lock`.
- **Never commit** `.env` or `.env.local`.
- Work happens in phases. Each phase gets its own branch and pull request, and is merged only after review.
- Run lint and typecheck in every project you touch (`pnpm lint` / `pnpm typecheck` at the root runs them all).

## Roadmap

- [x] **Phase 0**: baseline project setup
- [x] **Phase 1**: Convex backend (menu, inventory, orders, admin role checks)
- [x] **Phase 2**: admin panel (live order board, menu and stock CRUD, image uploads, demo order seed)
- [x] **Phase 3**: customer app (menu, cart, checkout, live order tracking)
