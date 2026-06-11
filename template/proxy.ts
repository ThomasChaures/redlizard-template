import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Proxy de Next.js 16 (antes "middleware").
 * Corre antes de cada request: refresca la sesión de Supabase y protege rutas.
 */
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  // No corras el proxy sobre assets estáticos ni el favicon.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
