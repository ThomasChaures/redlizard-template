"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { login, type AuthState } from "../actions";
import {
  inputClass,
  labelClass,
  primaryButtonClass,
  errorClass,
  linkClass,
} from "../ui";

const initialState: AuthState = {};

export function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const [state, formAction, pending] = useActionState(login, initialState);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      {redirectTo ? (
        <input type="hidden" name="redirectTo" value={redirectTo} />
      ) : null}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className={labelClass}>
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
          autoFocus
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-baseline justify-between">
          <label htmlFor="password" className={labelClass}>
            Password
          </label>
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-pressed={showPassword}
            className="cursor-pointer text-xs font-semibold text-muted hover:text-ink"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
        <input
          id="password"
          name="password"
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
          placeholder="••••••••"
          required
          className={inputClass}
        />
      </div>

      {state.error ? (
        <p role="alert" className={errorClass}>
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        aria-busy={pending}
        className={primaryButtonClass}
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>

      <p className="mt-1 text-center text-sm text-muted">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className={linkClass}>
          Create one
        </Link>
      </p>
    </form>
  );
}
