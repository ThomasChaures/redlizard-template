import { login, signup } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main>
      <div className="card">
        <h1>Sign in</h1>
        <p className="muted">Sign in with your email and password.</p>

        <form>
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" autoComplete="email" required />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />

          {error ? <p className="error">{error}</p> : null}

          <div className="row">
            <button className="primary" formAction={login}>
              Sign in
            </button>
            <button formAction={signup}>Create account</button>
          </div>
        </form>
      </div>
    </main>
  );
}
