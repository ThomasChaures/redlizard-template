import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { clientEnv } from "@/lib/env";
import type { Database } from "@/lib/supabase/database.types";

// Routes reachable without a session. Everything else requires an authenticated user.
const PUBLIC_PATHS = ["/", "/login", "/auth", "/error"];

function isPublic(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

/**
 * Refreshes the session on every request and protects routes.
 *
 * Golden rules:
 *  - Do NOT run code between createServerClient and getClaims().
 *  - Use getClaims() (validates the JWT signature). Never getSession() on the server.
 *  - ALWAYS return `supabaseResponse` so the refreshed cookies aren't lost.
 */
export async function updateSession(request: NextRequest): Promise<NextResponse> {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    clientEnv.NEXT_PUBLIC_SUPABASE_URL,
    clientEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          supabaseResponse = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            supabaseResponse.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  // Validates the JWT against the project's public keys (doesn't trust the raw cookie).
  const {
    data: { claims },
  } = await supabase.auth.getClaims();

  const { pathname } = request.nextUrl;

  if (!claims && !isPublic(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
