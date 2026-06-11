import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  // Sólo cerramos sesión si efectivamente hay un usuario válido.
  const {
    data: { claims },
  } = await supabase.auth.getClaims();

  if (claims) {
    await supabase.auth.signOut();
  }

  return NextResponse.redirect(new URL("/login", request.url), { status: 303 });
}
