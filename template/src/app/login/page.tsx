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
        <h1>Ingresar</h1>
        <p className="muted">Accedé con tu email y contraseña.</p>

        <form>
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" autoComplete="email" required />

          <label htmlFor="password">Contraseña</label>
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
              Ingresar
            </button>
            <button formAction={signup}>Crear cuenta</button>
          </div>
        </form>
      </div>
    </main>
  );
}
