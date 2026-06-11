# {{PROJECT_NAME}}

Next.js 16 + TypeScript + Supabase with **end-to-end security** and Claude Code
tooling (MCP + Skills) preconfigured.

## What's included

- Auth with `@supabase/ssr` (cookie-based session, automatic refresh in `proxy.ts`).
- Server-side JWT validation with `getClaims()` (never `getSession()`).
- Strict separation of **publishable** (client) and **secret** (server, bypasses RLS) keys.
- Environment variables validated with Zod (`src/lib/env.ts`).
- **RLS deny-by-default** with an example migration and profile trigger.
- Security headers + CSP in `next.config.ts`.
- Protected routes in two layers (proxy + layout that re-validates).
- `.mcp.json` with the Supabase MCP (read-only) and a security Skill for Claude Code.

## Setup

1. **Credentials.** Copy `.env.example` to `.env.local` and fill in the values for
   your project (Supabase Dashboard → *Connect* → *App Frameworks*):

   ```bash
   cp .env.example .env.local
   ```

   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (`sb_publishable_...`)
   - `SUPABASE_SECRET_KEY` (`sb_secret_...`, only if you use the admin client)

2. **Database.** Link the project and apply the migrations:

   ```bash
   supabase login
   supabase link --project-ref <your-project-ref>
   supabase db push
   npm run db:types   # regenerate the schema types
   ```

   Or locally with Docker: `npm run db:start`.

3. **MCP in Claude Code.** Authenticate the Supabase server (OAuth, no PAT):

   ```bash
   claude /mcp
   ```

4. **Run.**

   ```bash
   npm run dev
   ```

## Security

The rules that keep the chain secure live in
`.claude/skills/supabase-security/SKILL.md`. The essentials:

| Layer          | Mechanism                                              |
| -------------- | ------------------------------------------------------ |
| Transport      | HSTS + `upgrade-insecure-requests`                     |
| Headers        | CSP, X-Frame-Options, nosniff, Referrer-Policy         |
| Session        | httpOnly cookies + refresh in `proxy.ts`               |
| Authorization  | `getClaims()` on the server + RLS in the database      |
| Data           | RLS deny-by-default, policies per `auth.uid()`         |
| Secrets        | secret key isolated in `server-only`, validated in env |

> The Supabase MCP is configured **read-only** and meant for development.
> Do not point it at production data.

## Environments and migrations (CI/CD)

Each environment is a **separate Supabase project**:

| Environment | Where it runs       | How migrations are applied               |
| ----------- | ------------------- | ---------------------------------------- |
| Local       | Docker (`db:start`) | `npm run db:start` / `npm run db:reset`  |
| Staging     | Supabase project    | push to `develop` → CI pipeline          |
| Prod        | Supabase project    | push to `main` → CI pipeline             |

Migrations are **not applied by hand** on staging/prod: your CI does it, based on
the platform you chose when creating the project (GitHub Actions, Bitbucket
Pipelines or GitLab CI).

### Configuration (once)

1. Create two Supabase projects: one for staging and one for production.
2. Decide where the secrets go, depending on your platform:
   - **GitHub:** Settings → Environments → `staging` / `production`.
   - **Bitbucket:** Repository settings → Deployments → `staging` / `production`.
   - **GitLab:** Settings → CI/CD → Variables (scoped per environment).
3. In each environment, set these values (from *that* project):
   - `SUPABASE_ACCESS_TOKEN` — personal access token of your Supabase account.
   - `SUPABASE_DB_PASSWORD` — that project's database password (mark it as secret).
   - `SUPABASE_PROJECT_ID` — that project's `project-ref`.

From then on: PR → the pipeline validates that migrations apply on a clean
database and that types are in sync; merge to `develop`/`main` → it runs
`supabase db push` against staging/prod.

> Never make schema changes directly on the remote database via the SQL Editor or
> Table Editor: that bypasses the migration history and makes `db push` fail with
> sync errors. On staging/prod, schema changes go through migration files only.
