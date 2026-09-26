# Hotbox MVP — Pizza ordering app + admin panel on a shared Convex backend

## Context
Hotbox is a single-store pizza delivery product. Today all three projects are still templates. `backend/convex` has only the demo `myFunctions.ts`/`numbers` table. `admin/` is the Convex+Clerk starter page. `app/` is a bare `<Slot />` with an inline sign-up form.

The MVP flow is:
- Customers browse the menu, add pizzas (sizes S/M/L) to a cart, and place a cash-on-delivery order.
- Customers track all their orders live.
- Admins (Clerk `publicMetadata.role === "admin"`) manage categories, ingredients/stock and pizzas.
- Admins move orders through **pending → cooking → out_for_delivery → delivered** (or cancelled).
- Convex queries give real-time updates on both sides.

Decisions confirmed with the user:
- Sizes S/M/L.
- Cash on delivery.
- shadcn/ui for admin (Kokonut/other blocks are fine where useful).
- **The app must be previewable on web.** SDK 57 native features are used only when they render on web or degrade gracefully there.

## Phase workflow (applies to every phase)
1. Start from an up-to-date `master` and create the phase branch.
2. Implement the phase. Run lint and typecheck in every touched project.
3. Commit, push, and open a PR against `master` with a summary, any manual setup steps and test notes.
4. **Stop and wait for the user's approval.** Merge only after an explicit "approve/merge".
5. Pull `master`, then start the next phase. Phases run strictly in order: 0 → 1 → 2 → 3.

---

## Phase 0 — Commit existing work (`master`, before anything else)
The working tree has uncommitted and staged changes:
- Modified: `admin/app/layout.tsx`, `admin/package.json`, and `app/` config, lockfile and `_layout`/`index`.
- Staged: `app/eas.json`.
- Deleted: the template `explore.tsx` and `animated-icon*`.
- Untracked: `app/src/components/ConvexClientProvider.tsx` and `app/android/`.

Steps:
1. Run `git status` and `git diff` to review, and confirm that no `.env` or `.env.local` files are included.
2. **Flag `app/android/`:** `app/CLAUDE.md` says native dirs are generated (CNG) and not hand-edited, so it normally belongs in `app/.gitignore`. Ask the user whether to gitignore it or commit it before staging.
3. Commit everything else to `master` with a descriptive message (e.g. `chore: wire Convex+Clerk providers and EAS config`). Push if a remote exists.

## Phase 1 — Backend (`backend/`, branch `feat/backend-core`)
Read `backend/convex/_generated/ai/guidelines.md` before writing any Convex code. Keep `myFunctions.ts` until Phase 2, because admin's template page still imports it.

**`convex/schema.ts`**, with all money stored as integer cents:
- `categories`: `name`, `sortOrder`. Index `by_sortOrder`.
- `ingredients`: `name`, `inStock: boolean`. Index `by_name`.
- `pizzas`:
  - Fields: `name`, `description`, `categoryId`, `ingredientIds: v.array(v.id("ingredients"))`, `prices: v.object({ small, medium, large })`, `imageId: v.optional(v.id("_storage"))`, `isAvailable`.
  - Indexes: `by_category`, `by_available`.
- `orders`:
  - Customer fields: `userId` (identity `subject`), `customerName`, `address`, `phone`, `notes?`.
  - `items: v.array({ pizzaId, name, size, unitPrice, quantity })`. This is a snapshot, so later menu edits don't change past orders.
  - Money: `subtotal`, `deliveryFee`, `total`.
  - `status: "pending" | "cooking" | "out_for_delivery" | "delivered" | "cancelled"`, plus optional `cookingAt`, `outForDeliveryAt`, `deliveredAt`, `cancelledAt` timestamps for the timeline.
  - Indexes: `by_user`, `by_status`.

**`convex/lib/auth.ts`**
- `requireUser(ctx)` throws when unauthenticated.
- `requireAdmin(ctx)` checks the role claim on `ctx.auth.getUserIdentity()`.
- Enforcing this server-side is the real security boundary; the admin UI gate is convenience.

**`convex/lib/pricing.ts`**
- `DELIVERY_FEE`, and `ORDER_STATUS_FLOW`, which sets the allowed forward transitions.
- Cancel is allowed from pending or cooking by an admin, and from pending only by the customer.

**Function files**
| File | Public (signed-in user) | Admin-only |
|---|---|---|
| `categories.ts` | `list` | `create`, `update`, `remove` (blocked while pizzas reference it) |
| `ingredients.ts` | `list` | `create`, `update` (incl. `inStock`), `remove` (blocked while used) |
| `pizzas.ts` | `listMenu` (available pizzas + category + image URL + computed `soldOut` if any ingredient is out of stock), `get` | `adminList`, `create`, `update`, `remove` (also deletes the storage image), `generateUploadUrl` |
| `orders.ts` | `place`, `listMine`, `getMine`, `cancelMine` | `adminList` (by status), `adminGet`, `updateStatus` |

`orders.place` works only from `{pizzaId, size, quantity}[]`, and ignores any client-supplied prices:
- It re-reads the pizzas and rejects any that are unavailable or sold out.
- It computes prices server-side and clamps quantity to 1–20.
- It rejects an empty cart.

**`convex/seed.ts`**
- An `internalMutation` that seeds about 3 categories, about 12 ingredients and about 8 pizzas.
- Run it with `pnpm exec convex run seed:run`.

**Manual Clerk/Convex setup** for the user, documented in the PR:
1. In the Clerk Dashboard, customize the session token with `{"metadata": "{{user.public_metadata}}"}`. This is used by the Next proxy.
2. Make sure the token Convex receives carries the role. This means adding `"role": "{{user.public_metadata.role}}"` to the `convex` JWT template, or to the session token when using Clerk's native Convex integration. Check which one applies against the current Clerk/Convex docs (clerk skills in `backend/.agents/skills`) at implementation time. `requireAdmin` reads that claim.
3. On an admin user, set `{"role": "admin"}` in Public metadata.
4. Confirm `CLERK_FRONTEND_API_URL` is set in the Convex deployment env.

## Phase 2 — Admin panel (`admin/`, branch `feat/admin-panel`)
Read `admin/node_modules/next/dist/docs/` for Next 16 conventions first. Run `pnpm dlx shadcn@latest init` with Tailwind v4, then add button, card, table, dialog, sheet, form/input/label/textarea, select, switch, badge, sidebar, dropdown-menu, sonner and skeleton. Add lucide icons. Kokonut/other blocks are optional where they fit, such as the stat cards.

**Auth gate**
- `proxy.ts`: every route except `/sign-in` and `/unauthorized` requires sign-in and `sessionClaims.metadata.role === "admin"`. Everyone else is redirected to `/unauthorized`.
- `app/unauthorized/page.tsx` shows a friendly message and a `<SignOutButton>`.
- `app/sign-in/[[...sign-in]]/page.tsx` uses Clerk `<SignIn />`.

**Layout:** `app/(dashboard)/layout.tsx` has a shadcn Sidebar (Orders, Pizzas, Ingredients, Categories) and a `UserButton`.

**Pages** (all `"use client"`, using `useQuery`/`useMutation` from `@backend/convex/_generated/api`):
- `/` **Orders board**
  - Kanban columns: Pending, Cooking, Out for delivery, Delivered (today).
  - Each card shows the items, total, address and elapsed time. It has an "Advance" button with the next status label, plus Cancel.
  - Orders update live as customers place them, and a sonner toast fires on new pending orders.
  - Stat cards show today's count, revenue and active orders.
- `/orders/[id]` shows order detail with a status timeline and controls.
- `/pizzas`
  - Table with image, name, category, S/M/L prices, availability switch and sold-out badge.
  - Create/edit happens in a Sheet form with category select, ingredient multi-select (checkbox list), prices and image upload (`generateUploadUrl` → POST → `storageId`).
  - Delete asks for confirmation first.
- `/ingredients`: table with an inline in-stock Switch, and add/edit/delete dialogs.
- `/categories`: table with name and sort order, and CRUD dialogs.

**Cleanup:** delete the template's `app/page.tsx` content and `app/server/`, delete `backend/convex/myFunctions.ts`, and remove the `numbers` table. The backend part of this is a small cross-project edit made in this PR.

**Flag:** `admin/CLAUDE.md` lists `pnpm frontend`, but the script is `dev`. I'll point this out rather than silently change it.

## Phase 3 — Customer app (`app/`, branch `feat/app-ordering`)
Read the matching `docs.expo.dev/versions/v57.0.0/` pages before coding, per `app/CLAUDE.md`. Install packages with `pnpm expo install` only: `expo-haptics`.

**Backend import wiring**, mirroring admin's `@backend/*` alias:
- Add `"@backend/*": ["../backend/*"]` to `app/tsconfig.json`.
- Add a new `app/metro.config.js` with `watchFolders: [../backend]`, so Metro resolves `../backend/convex/_generated/api`.

**Routes**
```
src/app/_layout.tsx               Clerk + Convex + CartProvider; root <Stack> with Stack.Protected guard={isSignedIn}
src/app/(auth)/sign-in.tsx        custom Clerk sign-in (email+password), reuses current flow style
src/app/(auth)/sign-up.tsx        existing sign-up flow moved out of index.tsx
src/app/(app)/_layout.tsx         Stack: (tabs), pizza/[id], cart (presentation "formSheet", detents [0.6, 1], grabber)
src/app/(app)/(tabs)/_layout.tsx  NativeTabs: Menu / Orders / Account + BottomAccessory mini-cart
src/app/(app)/(tabs)/(menu)/…     Stack: index (menu)
src/app/(app)/(tabs)/orders/…     Stack: index (my orders), [id] (live tracking)
src/app/(app)/(tabs)/account/…    profile, sign out
```
Delete the unused template files `components/app-tabs*.tsx`, `external-link`, `hint-row`, `web-badge`, `ui/collapsible` and `animated-icon.module.css`. Reuse `constants/theme.ts`, `hooks/use-theme.ts` and `ThemedText`/`ThemedView`, extending the palette with a Hotbox brand accent (a warm tomato red).

**SDK 57 features.** Everything below works on web, or has a web fallback:
| Feature | Where | Web behavior |
|---|---|---|
| `NativeTabs` + SF Symbol / Material icons | Tab bar (Liquid Glass on iOS 26) | ✅ supported on web |
| `NativeTabs.Trigger.Badge` | Orders tab: active order count | ✅ |
| `NativeTabs.BottomAccessory` + `usePlacement()` | Mini-cart bar ("3 items · $42 → View cart"), compact when inline | ✅ supported on web |
| Stack `headerLargeTitle`, `headerTransparent`, `headerSearchBarOptions` | Menu screen search | Search bar is native-only, so on web (`Platform.OS === "web"`) an inline `TextInput` renders instead |
| `formSheet` presentation with detents + grabber | Cart | Renders as a modal on web |
| `Link.AppleZoom` / `Link.AppleZoomTarget` | Pizza card image → detail hero image | iOS-only; web gets a normal push |
| `Link.Preview` + `Link.Menu` | Long-press a pizza card → preview + "Add Medium to cart" | iOS-only; no-op on web |
| `Stack.Toolbar` | Order detail "Cancel order", pizza detail share/favorite | Native-only; a small `HeaderAction` wrapper renders a plain header button on web |
| `expo-glass-effect` `GlassView` (`isLiquidGlassAvailable()`) | Floating "Add to cart" bar, mini-cart | Falls back to a translucent `View` |
| `@expo/ui` SwiftUI `Picker` (segmented) | Size S/M/L picker | `SizePicker.ios.tsx` uses @expo/ui; `SizePicker.tsx` is a pressable segmented control for web and Android |
| `expo-image` (placeholder + transition), `expo-haptics` | Menu images, add-to-cart feedback | Haptics no-op on web |

**Screens**
- **Menu:** category chips (horizontal) and search filter, with a pizza grid of cards showing image, name, "from $X" and a sold-out overlay. The data is live `pizzas.listMenu`, so an admin toggling stock updates it instantly.
- **Pizza detail** (`pizza/[id]`): hero image, description, ingredient chips, SizePicker, quantity stepper, and a glass "Add to cart · $Y" bar.
- **Cart sheet:** line items with steppers and swipe-free remove buttons, then subtotal, delivery fee and total. It collects delivery address, phone and notes, with a "Place order (cash on delivery)" button that calls `orders.place`, clears the cart and navigates to `orders/[id]`.
- **Orders:** a live list with status pills, active orders first.
- **Order detail:** a vertical progress timeline (Placed → Cooking → Out for delivery → Delivered) with timestamps, updated live as the admin advances it. Cancel is available while pending.
- **Account:** name and email, plus sign out.

**Cart state:** `src/components/cart/CartProvider.tsx`, a React context and reducer keyed by `pizzaId+size`, in memory for the MVP. Prices shown in the cart come from the live menu query. The server recomputes them at order time.

---

## Verification
1. **Every project:** `pnpm lint` and typecheck (`pnpm typecheck` in backend and admin, `pnpm exec tsc --noEmit` in app) must pass.
2. **Backend:** `pnpm dev` deploys the schema, then `pnpm exec convex run seed:run`. Call `orders:updateStatus` as a non-admin in the Convex dashboard and confirm it throws.
3. **Admin** (`pnpm dev`):
   - A non-admin account is redirected to `/unauthorized`.
   - An admin account can CRUD a category, an ingredient and a pizza, including image upload.
   - Toggling an ingredient out of stock marks the dependent pizzas sold out.
4. **App** (`pnpm web` for the primary check, plus the Android dev build or iOS where available):
   - Sign up or sign in, browse, filter and search.
   - Add two sizes of a pizza, then open the cart sheet and place an order.
5. **End-to-end real-time check:** keep the admin board and the app open side by side.
   - The new order appears in Pending immediately, with a toast.
   - Advance it to Cooking → Out for delivery → Delivered.
   - The app's order timeline and the Orders tab badge update live without a refresh.
   - Customer cancel works only while the order is pending.