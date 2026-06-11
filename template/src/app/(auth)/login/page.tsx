import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>;
}) {
  const { redirectTo } = await searchParams;

  return (
    <main className="grid min-h-dvh place-items-center px-5 py-8">
      <div className="w-full max-w-sm rounded-xl border border-line bg-surface p-8 shadow-card">
        <header className="mb-7">
          <h1 className="text-[1.45rem] font-semibold tracking-tight">Welcome back</h1>
          <p className="mt-1 text-sm text-muted">Sign in to your account to continue.</p>
        </header>
        <LoginForm redirectTo={redirectTo} />
      </div>
    </main>
  );
}
