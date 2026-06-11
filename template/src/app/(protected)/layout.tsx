import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Defense in depth: on top of the proxy, every protected layout re-validates
 * the JWT on the server with getClaims(). Never trust the proxy alone.
 */
export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { claims },
  } = await supabase.auth.getClaims();

  if (!claims) {
    redirect("/login");
  }

  return <>{children}</>;
}
