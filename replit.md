# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **Build**: esbuild (API server)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Artifacts

### `artifacts/murcielago` — Murciélago Spanish Learning App (web)
- React + Vite + TypeScript frontend
- Routes: `/` (login), `/register`, `/dashboard`, `/practice/*`, `/grammar`, `/conversation`, `/admin`, etc.
- Auth: **Clerk** (`@clerk/react` v6) — email/password + Google OAuth + Apple OAuth
- CSS: Tailwind v3 (postcss), custom design tokens in `index.css`, fonts from Google Fonts
- Key contexts: `AuthContext`, `ProgressContext`, `StreakContext`, `LanguageContext`
- All data fetching via `src/lib/api.ts` fetch client hitting `/api/*` on the API server
- No Supabase references remain — fully migrated

### `artifacts/api-server` — Express REST API (port 8080)
- Routes:
  - `GET/POST /api/profile` — user profile (Clerk JWT auth)
  - `GET/POST /api/progress` — lesson progress
  - `GET/PUT /api/streaks` — daily streaks + activity logging
  - `GET/POST/PUT /api/vocabulary` — saved vocabulary words
  - `GET/POST/DELETE /api/flashcard-srs` — spaced repetition state
  - `POST /api/contact` — contact form messages
  - `GET /api/admin/users`, `GET /api/admin/messages`, `GET /api/admin/insights` — admin endpoints
  - `POST /api/ai/translate` — Spanish translation (OpenAI)
  - `POST /api/ai/conversation` — streaming conversation (OpenAI)
- Auth middleware: Clerk JWT verification (`@clerk/express`)
- DB: `@workspace/db` (Drizzle ORM, PostgreSQL)
- AI: OpenAI via Replit AI Integrations proxy

## Database Schema (`lib/db/src/schema/`)

Tables (all exported from `index.ts`):
- `profiles` — user profile (displayName, level, learningFrom, onboardingCompleted, placementTestCompleted)
- `user_roles` — admin/role flags
- `user_streaks` — streak tracking
- `activity_log` — activity history
- `user_progress` — per-lesson progress
- `user_last_activity` — last visited pages
- `grammar_progress` — grammar exercise results
- `user_vocabulary` — saved words
- `flashcard_srs` — spaced repetition card state
- `contact_messages` — contact form submissions

## Auth

- **Clerk** keys set: `VITE_CLERK_PUBLISHABLE_KEY` (frontend), `CLERK_SECRET_KEY` + `CLERK_PUBLISHABLE_KEY` (backend)
- SSO callback route: `/sso-callback` (frontend)
- API server uses `requireAuth()` middleware from `@clerk/express`

## AI Integration

- **OpenAI via Replit proxy**: `AI_INTEGRATIONS_OPENAI_BASE_URL` + `AI_INTEGRATIONS_OPENAI_API_KEY` env vars
- Package: `@workspace/integrations-openai-ai-server` added to api-server

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
