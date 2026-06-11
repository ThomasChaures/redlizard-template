import { SignupForm } from "./signup-form";

export default function SignupPage() {
  return (
    <main className="grid min-h-dvh place-items-center px-5 py-8">
      <div className="w-full max-w-sm rounded-xl border border-line bg-surface p-8 shadow-card">
        <header className="mb-7">
          <h1 className="text-[1.45rem] font-semibold tracking-tight">Create your account</h1>
          <p className="mt-1 text-sm text-muted">It takes less than a minute.</p>
        </header>
        <SignupForm />
      </div>
    </main>
  );
}
