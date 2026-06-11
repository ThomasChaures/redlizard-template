import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { clientEnv } from "@/lib/env";
import type { Database } from "@/lib/supabase/database.types";

/**
 * Client for Server Components, Server Actions and Route Handlers.
 * Reads the user session from cookies, so it respects RLS.
 *
 * Create a new one per request: it's lightweight and needs that request's cookies.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    clientEnv.NEXT_PUBLIC_SUPABASE_URL,
    clientEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // setAll from a Server Component throws (it can't write cookies).
            // The proxy already refreshes the session, so it's safe to ignore.
          }
        },
      },
    },
  );
}
