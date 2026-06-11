import "server-only";
import { createClient } from "@supabase/supabase-js";
import { clientEnv } from "@/lib/env";
import { serverEnv } from "@/lib/env";
import type { Database } from "@/lib/supabase/database.types";

/**
 * ⚠️  ADMIN client: uses the SECRET KEY and BYPASSES RLS entirely.
 *
 * Rules:
 *  - Server code only (this module imports "server-only").
 *  - Never pass it to a Server/Client Component or expose it in a response.
 *  - Use it only for controlled administrative operations (webhooks, jobs,
 *    creating users, etc.), validating authorization yourself.
 *  - For anything representing a "user" action, use the client from server.ts
 *    (which respects RLS).
 */
export function createAdminClient() {
  const env = serverEnv();
  if (!env.SUPABASE_SECRET_KEY) {
    throw new Error(
      "SUPABASE_SECRET_KEY is not configured. It is required for the admin client.",
    );
  }

  return createClient<Database>(
    clientEnv.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SECRET_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
