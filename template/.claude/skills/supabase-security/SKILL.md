---
name: supabase-security
description: "Mandatory security rules for working with Supabase + Next.js in this repo. ALWAYS consult this skill whenever you touch authentication, sessions, Supabase clients, RLS policies, SQL migrations, environment variables or API keys. Covers: server-side JWT validation, publishable/secret key separation, RLS deny-by-default, and correct use of the admin client."
---

# Supabase + Next.js Security

> For general Supabase security (RLS internals, views, `SECURITY DEFINER`, the
> CLI/MCP, the security checklist), the authoritative source is the official
> **`supabase`** skill. This skill only covers the conventions specific to **this
> template**: which client to use, the Next 16 proxy, the two-layer guard, and the
> project's `.mcp.json`. When they overlap, the `supabase` skill wins.

These rules are not optional. If a task conflicts with them, stop and flag it instead of working around them.

## Authentication and sessions

- In **server** code (Server Components, Server Actions, Route Handlers, `proxy.ts`) validate identity with `supabase.auth.getClaims()`. It validates the JWT signature.
- **Never** use `supabase.auth.getSession()` on the server to decide access: it does not revalidate the token and the cookie can be spoofed.
- Protect in two layers: `proxy.ts` redirects, and **each** protected layout re-validates with `getClaims()`. Don't trust the proxy alone.
- Don't put logic between `createServerClient(...)` and the first auth call in the proxy.

## API keys

- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` is public and may reach the browser. Security comes from RLS, not from the key being secret.
- `SUPABASE_SECRET_KEY` (`sb_secret_...`) **bypasses RLS**. Rules:
  - Never with a `NEXT_PUBLIC_` prefix. Never imported in client code.
  - Only via `lib/supabase/admin.ts` (which imports `server-only`).
  - Never return it in a response, log it, or pass it to a component.
- If you need a new secret, add it to the server schema in `lib/env.ts`, never the client schema.

## Client choice

- Browser / Client Component → `lib/supabase/client.ts`.
- Server "as the user" (respects RLS) → `lib/supabase/server.ts`. **This is the default.**
- Administrative tasks that must bypass RLS → `lib/supabase/admin.ts`, after validating authorization yourself.

## Row Level Security

- Every new table in `public` is created with `enable row level security` **and** `force row level security`.
- Deny-by-default: add minimal, explicit policies (`select`/`insert`/`update`/`delete` separately), scoped to the `authenticated` role and to `auth.uid()`.
- `security definer` functions: always with `set search_path = ''` and fully-qualified table names (`public.table`).
- After changing the schema, regenerate types: `npm run db:types`.

## Migrations

- Every schema change goes as a versioned migration in `supabase/migrations/`. Don't edit tables by hand in the dashboard of a shared environment.
- If the Supabase MCP is in `read_only`, don't attempt `apply_migration`; ask the human to adjust the scope deliberately.

## MCP

- The Supabase MCP is for **development**, never pointed at production data.
- Keep `read_only=true` unless the human explicitly asks otherwise.
