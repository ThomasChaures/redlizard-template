import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  // En server validamos el JWT con getClaims(), nunca getSession().
  const {
    data: { claims },
  } = await supabase.auth.getClaims();

  return (
    <main>
      <div className="card">
        <h1>{{PROJECT_NAME}}</h1>
        <p className="muted">Next.js + Supabase con seguridad end-to-end.</p>

        {claims ? (
          <>
            <div className="kv">Sesión activa: {claims.email ?? claims.sub}</div>
            <div className="row">
              <Link href="/dashboard" style={{ flex: 1 }}>
                <button className="primary" style={{ width: "100%" }}>
                  Ir al dashboard
                </button>
              </Link>
            </div>
          </>
        ) : (
          <div className="row">
            <Link href="/login" style={{ flex: 1 }}>
              <button className="primary" style={{ width: "100%" }}>
                Ingresar
              </button>
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
