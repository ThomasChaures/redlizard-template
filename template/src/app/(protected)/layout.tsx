import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Defensa en profundidad: además del proxy, cada layout protegido vuelve a
 * validar el JWT en el servidor con getClaims(). Nunca confiar sólo en el proxy.
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
