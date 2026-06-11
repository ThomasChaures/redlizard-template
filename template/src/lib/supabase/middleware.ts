import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { clientEnv } from "@/lib/env";
import type { Database } from "@/lib/supabase/database.types";

// Rutas accesibles sin sesión. Todo lo demás exige usuario autenticado.
const PUBLIC_PATHS = ["/", "/login", "/auth", "/error"];

function isPublic(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

/**
 * Refresca la sesión en cada request y protege rutas.
 *
 * Reglas de oro:
 *  - NO ejecutes código entre createServerClient y getClaims().
 *  - Usá getClaims() (valida la firma del JWT). Nunca getSession() en server.
 *  - Devolvé SIEMPRE el `supabaseResponse` para no perder las cookies refrescadas.
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

  // Valida el JWT contra las llaves públicas del proyecto (no confía en la cookie cruda).
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
