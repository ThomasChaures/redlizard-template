import Link from "next/link";

export default function ErrorPage() {
  return (
    <main>
      <div className="card">
        <h1>Something went wrong</h1>
        <p className="muted">
          We couldn't complete the action. Try again or sign in again.
        </p>
        <div className="row">
          <Link href="/login" style={{ flex: 1 }}>
            <button className="primary" style={{ width: "100%" }}>
              Back to sign in
            </button>
          </Link>
        </div>
      </div>
    </main>
  );
}
