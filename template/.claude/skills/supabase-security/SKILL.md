---
name: supabase-security
description: "Reglas de seguridad obligatorias para trabajar con Supabase + Next.js en este repo. Consultá este skill SIEMPRE que vayas a tocar autenticación, sesiones, clientes de Supabase, políticas RLS, migraciones SQL, variables de entorno o claves de API. Cubre: validación de JWT en server, separación de claves publishable/secret, RLS deny-by-default, y el uso correcto del cliente admin."
---

# Seguridad Supabase + Next.js

Estas reglas no son opcionales. Si una tarea entra en conflicto con ellas, pará y avisá en vez de saltearlas.

## Autenticación y sesiones

- En código **server** (Server Components, Server Actions, Route Handlers, `proxy.ts`) validá la identidad con `supabase.auth.getClaims()`. Valida la firma del JWT.
- **Nunca** uses `supabase.auth.getSession()` en server para decidir acceso: no revalida el token y se puede falsificar la cookie.
- Protegé en dos capas: el `proxy.ts` redirige, y **además** cada layout protegido vuelve a validar con `getClaims()`. No confíes sólo en el proxy.
- No metas lógica entre `createServerClient(...)` y la primera llamada de auth en el proxy.

## Claves de API

- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` es pública y puede ir al browser. La seguridad la da RLS, no el secreto de la clave.
- `SUPABASE_SECRET_KEY` (`sb_secret_...`) **bypassa RLS**. Reglas:
  - Jamás con prefijo `NEXT_PUBLIC_`. Jamás importada en código cliente.
  - Sólo vía `lib/supabase/admin.ts` (que importa `server-only`).
  - Nunca devolverla en una respuesta, log, ni pasarla a un componente.
- Si necesitás un secreto nuevo, agregalo al schema server de `lib/env.ts`, nunca al schema cliente.

## Elección de cliente

- Browser / Client Component → `lib/supabase/client.ts`.
- Server "como el usuario" (respeta RLS) → `lib/supabase/server.ts`. **Este es el default.**
- Tareas administrativas que deben saltear RLS → `lib/supabase/admin.ts`, validando vos la autorización antes.

## Row Level Security

- Toda tabla nueva en `public` nace con `enable row level security` **y** `force row level security`.
- Deny-by-default: agregá políticas mínimas y explícitas (`select`/`insert`/`update`/`delete` por separado), acotadas al rol `authenticated` y a `auth.uid()`.
- Funciones `security definer`: siempre con `set search_path = ''` y nombres de tabla calificados (`public.tabla`).
- Después de cambiar el esquema, regenerá tipos: `npm run db:types`.

## Migraciones

- Todo cambio de esquema va como migración versionada en `supabase/migrations/`. No edites tablas a mano en el dashboard de un entorno compartido.
- Si el MCP de Supabase está en `read_only`, no intentes `apply_migration`; pedí al humano que ajuste el scope conscientemente.

## MCP

- El MCP de Supabase es para **desarrollo**, nunca apuntado a datos de producción.
- Mantené `read_only=true` salvo que el humano pida explícitamente lo contrario.
