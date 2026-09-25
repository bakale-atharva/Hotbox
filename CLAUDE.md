# Project Instructions

# Hotbox

A pizza delivery app vibe-coded using Claude, inspired by Sonny Sangha.

This file gives Claude Code the context it needs to work in this repo. Keep it short, current, and specific — update it as the project changes.

## Project Overview

The repo contains three separate projects, each with its own `package.json`, lockfile, and `node_modules`. There is no root workspace — run every command from inside the relevant folder.

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
- Never install dependencies in one project from the other's folder, or add a root-level `package.json` without asking.

## Notes For Claude

- Ask before making architectural changes not covered above.
- Prefer editing existing files over creating new ones unless the project structure calls for it.
- If a command in any CLAUDE.md fails or looks out of date, flag it rather than guessing a replacement.
- Run lint and typecheck for every project you touched before declaring a task done.
