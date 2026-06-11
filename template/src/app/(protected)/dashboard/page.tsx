import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims ?? null;
  if (!claims) redirect("/login");

  // This query respects RLS: it only returns the row the user is allowed to see.
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, created_at")
    .eq("id", claims.sub)
    .maybeSingle();

  return (
    <main className="grid min-h-dvh place-items-center px-5 py-8">
      <div className="w-full max-w-md rounded-xl border border-line bg-surface p-8 shadow-card">
        <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted">Protected route. Data filtered by RLS.</p>

        <dl className="mt-4 space-y-3">
          <div className="rounded-lg border border-line bg-surface-2 px-4 py-3 text-sm">
            <dt className="font-semibold text-ink">User</dt>
            <dd className="mt-0.5 break-words text-muted">{claims.email ?? claims.sub}</dd>
          </div>
          <div className="rounded-lg border border-line bg-surface-2 px-4 py-3 text-sm">
            <dt className="font-semibold text-ink">Profile</dt>
            <dd className="mt-0.5 text-muted">
              {profile?.display_name ?? "No display name set"}
            </dd>
          </div>
        </dl>

        <form action="/auth/signout" method="post" className="mt-6">
          <button
            type="submit"
            className="w-full cursor-pointer rounded-lg border border-line-strong bg-surface px-4 py-2.5 text-sm font-semibold text-ink transition hover:bg-surface-2"
          >
            Sign out
          </button>
        </form>
      </div>
    </main>
  );
}
