# Hotbox — Customer App

The customer-facing Hotbox app, built with [Expo](https://expo.dev) SDK 57, React Native and Expo Router. It runs on iOS, Android and the **web**, and uses [Clerk](https://clerk.com) for sign-in and the shared [Convex backend](../backend/) for live data.

> **Status:** the ordering experience is built in **Phase 3**. Today the app has Clerk sign-up wired to Convex.

## Planned features (Phase 3)

- **Menu**: browse pizzas by category and search. Sold-out pizzas update live as the store changes stock.
- **Pizza details**: pick a size (S/M/L) and quantity, then add to cart.
- **Cart and checkout**: review items and totals, enter a delivery address and phone number, and place a **cash-on-delivery** order.
- **Orders**: see all your orders with live status tracking (placed → cooking → out for delivery → delivered). You can cancel while an order is still pending.
- **Native feel with a web fallback**: native tabs with a mini-cart bar, a form-sheet cart, and Liquid Glass and zoom transitions on iOS. Everything still works in the browser, so you can preview the app on the web.

## Commands

Run these from inside `app/`. The Convex backend runs separately (`cd ../backend && pnpm dev`).

| Command | What it does |
| --- | --- |
| `pnpm install` | Install dependencies |
| `pnpm web` | Start the app in the browser (the quickest way to preview) |
| `pnpm start` | Start the Expo dev server |
| `pnpm android` / `pnpm ios` | Build and run a development build locally |
| `pnpm lint` | Lint |
| `pnpm exec tsc --noEmit` | Typecheck |

- **Adding packages**: always use `pnpm expo install <package>`, not `pnpm add`, so the versions stay compatible with SDK 57.
- **Diagnosing problems**: run `pnpm dlx expo-doctor`.

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
  app/          Expo Router routes (every file is a screen; _layout.tsx files define navigators)
  components/   Shared components, including ConvexClientProvider
  constants/    Theme: colors, fonts, spacing
  hooks/        Theme and color-scheme hooks
assets/         Icons, splash and images
```

## Native builds

- `android/` and `ios/` are **generated** by Expo (Continuous Native Generation) and are gitignored. Configure native behaviour in `app.json` and config plugins, never by editing those folders.
- Libraries with native code need a development build (`pnpm android` / `pnpm ios`, or EAS). They won't work in Expo Go.
- Cloud builds use [EAS](https://docs.expo.dev/eas/): `pnpm dlx eas-cli@latest build --profile development` (profiles are in `eas.json`).
