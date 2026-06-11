import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { claims },
  } = await supabase.auth.getClaims();

  // Esta consulta respeta RLS: sólo devuelve la fila que el usuario puede ver.
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, created_at")
    .eq("id", claims!.sub)
    .maybeSingle();

  return (
    <main>
      <div className="card">
        <h1>Dashboard</h1>
        <p className="muted">Ruta protegida. Datos filtrados por RLS.</p>

        <div className="kv">
          <strong>Usuario:</strong> {claims!.email ?? claims!.sub}
        </div>
        <div className="kv">
          <strong>Perfil:</strong>{" "}
          {profile?.display_name ?? "Sin nombre configurado"}
        </div>

        <form action="/auth/signout" method="post">
          <div className="row">
            <button type="submit" style={{ width: "100%" }}>
              Cerrar sesión
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
