import Link from "next/link";

export default function ErrorPage() {
  return (
    <main className="grid min-h-dvh place-items-center px-5 py-8">
      <div className="w-full max-w-md rounded-xl border border-line bg-surface p-8 shadow-card">
        <h1 className="text-xl font-semibold tracking-tight">Something went wrong</h1>
        <p className="mt-1 text-sm text-muted">
          We could not complete the action. Try again or sign in again.
        </p>
        <Link
          href="/login"
          className="mt-6 block w-full rounded-lg bg-ink px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-ink-2"
        >
          Back to sign in
        </Link>
      </div>
    </main>
  );
}
