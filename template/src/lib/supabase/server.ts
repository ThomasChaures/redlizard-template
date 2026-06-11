import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { clientEnv } from "@/lib/env";
import type { Database } from "@/lib/supabase/database.types";

/**
 * Cliente para Server Components, Server Actions y Route Handlers.
 * Lee la sesión del usuario desde las cookies, por lo que respeta RLS.
 *
 * Creá uno nuevo por request: es liviano y necesita las cookies de esa request.
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
            // setAll desde un Server Component falla (no puede escribir cookies).
            // El proxy (proxy.ts / middleware) ya refresca la sesión, así que es seguro ignorarlo.
          }
        },
      },
    },
  );
}
