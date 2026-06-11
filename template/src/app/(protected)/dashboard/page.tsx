import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { claims },
  } = await supabase.auth.getClaims();

  // This query respects RLS: it only returns the row the user is allowed to see.
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, created_at")
    .eq("id", claims!.sub)
    .maybeSingle();

  return (
    <main>
      <div className="card">
        <h1>Dashboard</h1>
        <p className="muted">Protected route. Data filtered by RLS.</p>

        <div className="kv">
          <strong>User:</strong> {claims!.email ?? claims!.sub}
        </div>
        <div className="kv">
          <strong>Profile:</strong>{" "}
          {profile?.display_name ?? "No display name set"}
        </div>

        <form action="/auth/signout" method="post">
          <div className="row">
            <button type="submit" style={{ width: "100%" }}>
              Sign out
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
