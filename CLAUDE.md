# Project Instructions

# Hotbox

A pizza delivery app vibe-coded using Claude, inspired by Sonny Sangha.

This file gives Claude Code the context it needs to work in this repo. Keep it short, current, and specific — update it as the project changes.

## Project Overview

The repo is a pnpm workspace orchestrated by [Turborepo](https://turborepo.dev). It contains three packages (`@hotbox/app`, `@hotbox/admin`, `@hotbox/backend`), each with its own `package.json` and `node_modules`, sharing one root `pnpm-lock.yaml`. Run `pnpm install` from the root.

- **All dev servers:** `pnpm dev` from the root (turbo TUI; press `i` to interact with a task, e.g. Expo shortcuts)
- **One package:** `pnpm turbo dev --filter=@hotbox/admin`
- **Whole repo:** `pnpm lint`, `pnpm typecheck`, `pnpm build` from the root. Per-package scripts still work from inside each folder.

| Folder     | What it is                 | Stack                                | Instructions                       |
| ---------- | -------------------------- | ------------------------------------ | ---------------------------------- |
| `app/`     | Customer-facing mobile app | Expo, React Native, Expo Router      | [app/CLAUDE.md](app/CLAUDE.md)     |
| `admin/`   | Admin dashboard            | Next.js, Clerk, Tailwind CSS         | [admin/CLAUDE.md](admin/CLAUDE.md) |
| `backend/` | Shared Convex backend      | Convex                               | [backend/CLAUDE.md](backend/CLAUDE.md) |

- **Primary language:** TypeScript
- **Package manager:** pnpm (all three projects). Never use npm or yarn, and never commit a `package-lock.json` or `yarn.lock`.

## Git Workflow

The plan is divided into phases. The user will tell you to do a phase. At that time, you need to complete the phase on a separate branch and then create a pull request. Only after the user approves it should it be merged.

## Guardrails — Never Do This

- Never commit `.env` or `.env.local` files (`app/`, `admin/`, and `backend/` each have one).
- Never add a dependency to the wrong package. Use `pnpm add <pkg> --filter @hotbox/<name>` (or run it inside that folder). Only root tooling like `turbo` belongs in the root `package.json`.
- Never add per-package `pnpm-lock.yaml` or `pnpm-workspace.yaml` files. Workspace settings (`allowBuilds`, `overrides`) live in the root `pnpm-workspace.yaml`.

## Notes For Claude

- Ask before making architectural changes not covered above.
- Prefer editing existing files over creating new ones unless the project structure calls for it.
- If a command in any CLAUDE.md fails or looks out of date, flag it rather than guessing a replacement.
- Run lint and typecheck for every project you touched before declaring a task done.
