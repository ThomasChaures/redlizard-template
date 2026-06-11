# {{PROJECT_NAME}}

Next.js 16 (App Router) + TypeScript + Supabase project with end-to-end security.

## Stack

- **Next.js 16** (App Router, Server Components, `proxy.ts` instead of `middleware.ts`).
- **Supabase** via `@supabase/ssr` (cookie-based auth, RLS).
- **Zod** for input and environment-variable validation.

## Commands

- `npm run dev` — development server.
- `npm run typecheck` — type checking.
- `npm run lint` — linter.
- `npm run db:start` — local Supabase (Docker).
- `npm run db:push` — apply migrations to the linked project.
- `npm run db:types` — regenerate `src/lib/supabase/database.types.ts`.

## Key structure

- `src/lib/supabase/client.ts` — browser client.
- `src/lib/supabase/server.ts` — server client (respects RLS). **Default.**
- `src/lib/supabase/admin.ts` — admin client (bypasses RLS, `server-only`).
- `src/lib/supabase/middleware.ts` — session refresh + route guard.
- `src/lib/env.ts` — environment validation (splits client/server).
- `proxy.ts` — Next 16 proxy entrypoint.
- `supabase/migrations/` — versioned schema with RLS.

## Skills (`.claude/skills/`)

This repo ships with several Claude Code skills:

- **`supabase`** — official Supabase skill (DB, Auth, RLS, CLI, MCP, security
  checklist). Authoritative for anything Supabase. Verify against its changelog
  before implementing.
- **`supabase-security`** — conventions specific to this template (which client
  to use, the Next 16 proxy, two-layer route guard, the project's `.mcp.json`).
- **`clean-code`** — Clean Code principles for writing and reviewing code.
- **`clean-ui`** — UI/UX design direction for this project. **All user-facing
  interface work must follow this skill**: clarity over decoration, obvious
  visual hierarchy, consistency, functional whitespace, minimal cognitive load,
  and accessibility. Read it before building or changing any page or component.
- **`find-skills`** — discover and install more skills from the ecosystem.

Before touching auth, sessions, Supabase clients, RLS, migrations or keys, follow
the **`supabase`** and **`supabase-security`** skills. In short:

1. On the server validate with `getClaims()`, never `getSession()`.
2. `SUPABASE_SECRET_KEY` never reaches the browser; only via `admin.ts`.
3. RLS enabled and forced on every new table; deny-by-default.
4. The Supabase MCP is for development, in `read_only`, never against production.

## MCP

`.mcp.json` includes the Supabase server (hosted, read-only). Authenticate with
`claude /mcp` the first time (OAuth, no personal access token required).
