# Hotbox — Admin Dashboard (`admin/`)

The admin dashboard. The Convex backend lives in the repo-level [backend/](../backend/) folder. Shared repo rules (git workflow, guardrails) live in the root [CLAUDE.md](../CLAUDE.md).

- **Frontend:** Next.js (App Router) + Tailwind CSS
- **Backend client:** Convex (`convex` package). Generated API types are imported from `@backend/convex/_generated/api`.
- **Auth:** Clerk (`@clerk/nextjs`), wired into Convex via `backend/convex/auth.config.ts` and `components/ConvexClientProvider.tsx`. Route protection lives in `proxy.ts`.

## Commands

Run from inside `admin/`. The Next server and Convex dev are separate long-running processes — run Convex from `backend/` (`pnpm dev`) in its own terminal.

- **Install:** `pnpm install`
- **Frontend (Next dev):** `pnpm frontend`
- **Lint:** `pnpm lint`
- **Typecheck:** `pnpm typecheck`
- **Build:** `pnpm build`

## Next.js has changed — do not trust your training data

This version of Next.js has breaking changes — APIs, conventions, and file structure may differ from what you remember (e.g. middleware is `proxy.ts`). Before writing Next.js code, read the relevant guide in `node_modules/next/dist/docs/` and heed deprecation notices.

## Structure

- `app/` — Next.js routes (`layout.tsx`, `page.tsx`, `server/`). Not to be confused with the repo-level `app/` folder, which is the Expo app.
- `components/` — shared React components.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
