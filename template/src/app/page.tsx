import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  // On the server we validate the JWT with getClaims(), never getSession().
  const {
    data: { claims },
  } = await supabase.auth.getClaims();

  return (
    <main>
      <div className="card">
        <h1>{{PROJECT_NAME}}</h1>
        <p className="muted">Next.js + Supabase with end-to-end security.</p>

        {claims ? (
          <>
            <div className="kv">Signed in as: {claims.email ?? claims.sub}</div>
            <div className="row">
              <Link href="/dashboard" style={{ flex: 1 }}>
                <button className="primary" style={{ width: "100%" }}>
                  Go to dashboard
                </button>
              </Link>
            </div>
          </>
        ) : (
          <div className="row">
            <Link href="/login" style={{ flex: 1 }}>
              <button className="primary" style={{ width: "100%" }}>
                Sign in
              </button>
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
