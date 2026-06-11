# {{PROJECT_NAME}}

Proyecto Next.js 16 (App Router) + TypeScript + Supabase con seguridad end-to-end.

## Stack

- **Next.js 16** (App Router, Server Components, `proxy.ts` en lugar de `middleware.ts`).
- **Supabase** vía `@supabase/ssr` (auth por cookies, RLS).
- **Zod** para validar entrada y variables de entorno.

## Comandos

- `npm run dev` — servidor de desarrollo.
- `npm run typecheck` — chequeo de tipos.
- `npm run lint` — linter.
- `npm run db:start` — Supabase local (Docker).
- `npm run db:push` — aplica migraciones al proyecto enlazado.
- `npm run db:types` — regenera `src/lib/supabase/database.types.ts`.

## Estructura clave

- `src/lib/supabase/client.ts` — cliente browser.
- `src/lib/supabase/server.ts` — cliente server (respeta RLS). **Default.**
- `src/lib/supabase/admin.ts` — cliente admin (bypassa RLS, `server-only`).
- `src/lib/supabase/middleware.ts` — refresco de sesión + guard de rutas.
- `src/lib/env.ts` — validación de env (separa cliente/servidor).
- `proxy.ts` — entrypoint del proxy de Next 16.
- `supabase/migrations/` — esquema versionado con RLS.

## Reglas de seguridad

Antes de tocar auth, sesiones, clientes de Supabase, RLS, migraciones o claves,
seguí el skill **`.claude/skills/supabase-security/SKILL.md`**. En resumen:

1. En server validá con `getClaims()`, nunca con `getSession()`.
2. `SUPABASE_SECRET_KEY` jamás llega al browser; sólo vía `admin.ts`.
3. RLS habilitado y forzado en toda tabla nueva; deny-by-default.
4. El MCP de Supabase es para desarrollo, en `read_only`, nunca contra producción.

## MCP

`.mcp.json` incluye el servidor de Supabase (hosted, read-only). Autenticá con
`claude /mcp` la primera vez (OAuth, sin necesidad de personal access token).
