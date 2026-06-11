import Link from "next/link";

export default function ErrorPage() {
  return (
    <main>
      <div className="card">
        <h1>Algo salió mal</h1>
        <p className="muted">
          No pudimos completar la acción. Probá nuevamente o volvé a ingresar.
        </p>
        <div className="row">
          <Link href="/login" style={{ flex: 1 }}>
            <button className="primary" style={{ width: "100%" }}>
              Volver al login
            </button>
          </Link>
        </div>
      </div>
    </main>
  );
}
