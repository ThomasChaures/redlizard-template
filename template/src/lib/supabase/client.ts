import { createBrowserClient } from "@supabase/ssr";
import { clientEnv } from "@/lib/env";
import type { Database } from "@/lib/supabase/database.types";

/**
 * Client for Client Components (runs in the browser).
 * createBrowserClient already uses an internal singleton: you can call it freely.
 * Uses the PUBLISHABLE key; real security is enforced by RLS policies.
 */
export function createClient() {
  return createBrowserClient<Database>(
    clientEnv.NEXT_PUBLIC_SUPABASE_URL,
    clientEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
}
