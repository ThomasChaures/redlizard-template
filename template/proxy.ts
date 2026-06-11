import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Next.js 16 proxy (formerly "middleware").
 * Runs before every request: refreshes the Supabase session and protects routes.
 */
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  // Don't run the proxy on static assets or the favicon.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
