import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  // On the server we validate the JWT with getClaims(), never getSession().
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims ?? null;

  return (
    <main className="grid min-h-dvh place-items-center px-5 py-8">
      <div className="w-full max-w-md rounded-xl border border-line bg-surface p-8 shadow-card">
        <h1 className="text-xl font-semibold tracking-tight">{{PROJECT_NAME}}</h1>
        <p className="mt-1 text-sm text-muted">
          Next.js + Supabase with end-to-end security.
        </p>

        {claims ? (
          <>
            <div className="mt-4 rounded-lg border border-line bg-surface-2 px-4 py-3 text-sm text-muted">
              Signed in as <strong className="font-semibold text-ink">{claims.email ?? claims.sub}</strong>
            </div>
            <Link
              href="/dashboard"
              className="mt-6 block w-full rounded-lg bg-ink px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-ink-2"
            >
              Go to dashboard
            </Link>
          </>
        ) : (
          <Link
            href="/login"
            className="mt-6 block w-full rounded-lg bg-ink px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-ink-2"
          >
            Sign in
          </Link>
        )}
      </div>
    </main>
  );
}
