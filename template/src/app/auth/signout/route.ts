import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  // Only sign out if there's actually a valid user.
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims ?? null;

  if (claims) {
    await supabase.auth.signOut();
  }

  return NextResponse.redirect(new URL("/login", request.url), { status: 303 });
}
