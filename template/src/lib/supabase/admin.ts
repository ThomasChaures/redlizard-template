import "server-only";
import { createClient } from "@supabase/supabase-js";
import { clientEnv } from "@/lib/env";
import { serverEnv } from "@/lib/env";
import type { Database } from "@/lib/supabase/database.types";

/**
 * ⚠️  Cliente ADMIN: usa la SECRET KEY y BYPASSEA RLS por completo.
 *
 * Reglas:
 *  - Sólo desde código server (este módulo importa "server-only").
 *  - Nunca lo pases a un Server/Client Component ni lo expongas en una respuesta.
 *  - Usalo sólo para operaciones administrativas controladas (webhooks, jobs,
 *    crear usuarios, etc.), validando vos mismo la autorización.
 *  - Para todo lo que represente acción "del usuario", usá el cliente de server.ts
 *    (respeta RLS).
 */
export function createAdminClient() {
  const env = serverEnv();
  if (!env.SUPABASE_SECRET_KEY) {
    throw new Error(
      "SUPABASE_SECRET_KEY no está configurada. Es obligatoria para el cliente admin.",
    );
  }

  return createClient<Database>(
    clientEnv.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SECRET_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
