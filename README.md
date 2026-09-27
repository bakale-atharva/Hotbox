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

These are **three independent projects**, each with its own `package.json`, lockfile and `node_modules`. There is no root workspace, so run every command from inside the relevant folder.

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

1. **Install** each project:
   ```bash
   cd backend && pnpm install
   cd ../admin && pnpm install
   cd ../app && pnpm install
   ```
2. **Configure env vars.** Each project has its own `.env.local` (see each README), and none of them are committed.
3. **Run the backend.** Leave this running; it deploys the functions and regenerates types on save:
   ```bash
   cd backend && pnpm dev
   ```
4. **Seed the menu**, and optionally demo orders for 27–30 Sep 2026 (both are safe to run more than once):
   ```bash
   cd backend && pnpm seed
   pnpm seed:orders
   ```
5. **Run the frontends**, each in its own terminal:
   ```bash
   cd admin && pnpm dev    # http://localhost:3000
   cd app && pnpm web      # or: pnpm start / pnpm android / pnpm ios
   ```

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
- Run lint and typecheck in every project you touch.

## Roadmap

- [x] **Phase 0**: baseline project setup
- [x] **Phase 1**: Convex backend (menu, inventory, orders, admin role checks)
- [x] **Phase 2**: admin panel (live order board, menu and stock CRUD, image uploads, demo order seed)
- [ ] **Phase 3**: customer app (menu, cart, checkout, live order tracking)
