import { createBrowserClient } from "@supabase/ssr";
import { clientEnv } from "@/lib/env";
import type { Database } from "@/lib/supabase/database.types";

/**
 * Cliente para Client Components (corre en el browser).
 * createBrowserClient ya usa un singleton interno: podés llamarlo sin miedo.
 * Usa la clave PUBLISHABLE; la seguridad real la imponen las políticas RLS.
 */
export function createClient() {
  return createBrowserClient<Database>(
    clientEnv.NEXT_PUBLIC_SUPABASE_URL,
    clientEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
}
