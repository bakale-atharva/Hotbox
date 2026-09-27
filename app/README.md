# Hotbox — Customer App

The customer-facing Hotbox app, built with [Expo](https://expo.dev) SDK 57, React Native and Expo Router. It runs on iOS, Android and the **web**, uses [Clerk](https://clerk.com) for sign-in, and uses the shared [Convex backend](../backend/) for live data.

## Features

| Screen | What you can do |
| --- | --- |
| **Sign in / Sign up** | Email and password with an email code. New-device verification is handled. |
| **Menu** (`/`) | Browse pizzas in a responsive grid (2, 3 or 4 columns) and filter by category chips. Search by name, description or topping. Sold-out pizzas update live as the store changes stock. |
| **Pizza** (`/pizza/[id]`) | Pick a size (S/M/L) and quantity, see the live price, then **Add to cart**. |
| **Cart** (`/cart`, form sheet) | Adjust quantities or remove items, see the subtotal, delivery fee and total, and enter a delivery address, phone and notes. **Place order** is cash on delivery. Sold-out items are flagged and skipped. Your draft is kept if you close the sheet. |
| **Orders** (`/orders`) | In-progress and past orders. Each shows a live status pill. |
| **Order** (`/orders/[id]`) | **Live tracking:** a timeline from placed to cooking to out for delivery to delivered, updated in real time as the kitchen moves your order. You can cancel while it's still pending. |
| **Account** (`/account`) | Your profile, order stats and sign out. |

## Native features (SDK 57), and what happens on web

| Feature | Where | Web / Android |
| --- | --- | --- |
| `NativeTabs` (Liquid Glass on iOS 26), SF Symbols + Material icons | Menu / Orders / Account tabs | ✅ Web renders a floating tab pill. Android uses Material 3 tabs. |
| `NativeTabs.Trigger.Badge` | Number of active orders on the Orders tab | ✅ |
| `NativeTabs.BottomAccessory` + `usePlacement()` | Mini cart above the tab bar | iOS only. Android and web get a floating **View cart** pill. |
| `Stack.SearchBar` | Menu search in the header | iOS and Android. Web gets an inline search field. |
| `Stack.Toolbar` + `Stack.Toolbar.Badge` | Cart button with item count on the Menu header | iOS. Other platforms use the floating cart pill. |
| `formSheet` with detents and a grabber | Cart | Opens as a modal on web. |
| `Link.AppleZoom` / `Link.AppleZoomTarget` | Pizza photo zooms into the detail hero | iOS 18+. Elsewhere it's a normal push. |
| `Link.Preview` + `Link.Menu` | Long-press a pizza to peek, or quick-add S/M/L. Long-press an order to peek. | iOS. Elsewhere it's a plain link. |
| `@expo/ui` `SegmentedControl` | Size picker | ✅ SwiftUI (iOS), Compose (Android), web implementation |
| `expo-glass-effect` `GlassView` | Floating **Add to cart** bar | Liquid Glass on iOS 26. A translucent card elsewhere. |
| `expo-image`, `expo-haptics` | Photos, tactile feedback | Haptics are iOS-only by design. |

## Commands

Run these from inside `app/`, or run `pnpm dev` at the repo root to start app, admin and backend together via Turborepo.

| Command | What it does |
| --- | --- |
| `pnpm install` | Install dependencies (run from the repo root, which has one lockfile) |
| `pnpm dev` / `pnpm web` | Start the app in the browser (the quickest way to preview) |
| `pnpm start` | Start the Expo dev server |
| `pnpm android` / `pnpm ios` | Build and run a development build locally |
| `pnpm lint` | Lint |
| `pnpm typecheck` | Typecheck |

- **Adding packages:** always use `pnpm expo install <package>`, not `pnpm add`, so versions stay compatible with SDK 57.
- **Diagnosing problems:** run `pnpm dlx expo-doctor`.
- **Typed routes errors:** if `pnpm typecheck` complains about hrefs like `"/"` right after adding or moving routes, restart the dev server. It regenerates `.expo/types/router.d.ts`.

## Environment

`app/.env.local` is not committed:

| Variable | Purpose |
| --- | --- |
| `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `EXPO_PUBLIC_CONVEX_URL` | Convex deployment URL |
| `EXPO_PUBLIC_CONVEX_SITE_URL` | Convex HTTP actions URL |

## Project structure

```
src/
  app/                        Expo Router routes (screens and layouts only)
    _layout.tsx               Clerk + Convex + theme + cart providers; Stack.Protected auth guard
    (auth)/                   sign-in, sign-up
    (app)/
      _layout.tsx             Stack: tabs + cart form sheet
      cart.tsx
      (tabs)/_layout.tsx      NativeTabs + mini cart
      (tabs)/(menu)/          Menu, pizza/[id]
      (tabs)/orders/          Orders list, [id] live tracking
      (tabs)/account/
  components/                 cart/, menu/, orders/, auth/, ui/ (button, icon, text field, …)
  constants/theme.ts          Hotbox colors (shared with admin), radius, spacing
  hooks/                      use-theme, use-cart-details, use-color-scheme
  utils/                      Price and date formatting, order status metadata, haptics, errors
```

- **Backend types** are imported through the `@backend/*` alias (`tsconfig.json` → `../backend/*`), the same as admin: `import { api } from "@backend/convex/_generated/api"`. Metro resolves it through Expo's built-in tsconfig paths and monorepo support.
- **Styling** uses the Hotbox brand tokens in `src/constants/theme.ts`. The hex values match `admin/app/globals.css`, so both apps share the tomato-red brand, the warm neutrals and the order-status colors.
- **Agent skills:** the official Expo skills (`expo/skills`) and the Clerk skills live in `.claude/skills` (see `skills-lock.json`).

## Native builds

- `android/` and `ios/` are **generated** by Expo (Continuous Native Generation) and are gitignored. Configure native behavior in `app.json` and config plugins, never by editing those folders.
- Libraries with native code need a development build (`pnpm android` / `pnpm ios`, or EAS). They won't work in Expo Go.
- Cloud builds use [EAS](https://docs.expo.dev/eas/): `pnpm dlx eas-cli@latest build --profile development` (profiles are in `eas.json`).
