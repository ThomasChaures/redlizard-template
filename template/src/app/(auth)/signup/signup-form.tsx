"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { signup, type AuthState } from "../actions";
import {
  inputClass,
  labelClass,
  primaryButtonClass,
  errorClass,
  linkClass,
} from "../ui";

const initialState: AuthState = {};

export function SignupForm() {
  const [state, formAction, pending] = useActionState(signup, initialState);
  const [showPassword, setShowPassword] = useState(false);

  if (state.success) {
    return (
      <div role="status" className="flex flex-col items-center gap-4 py-2 text-center">
        <div
          aria-hidden="true"
          className="grid size-12 place-items-center rounded-full bg-success-soft text-xl font-bold text-success"
        >
          ✓
        </div>
        <p className="text-[15px] text-ink">{state.success}</p>
        <Link
          href="/login"
          className="rounded-lg border border-line-strong bg-surface px-4 py-2.5 text-sm font-semibold text-ink transition hover:bg-surface-2"
        >
          Go to sign in
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
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
          autoComplete="new-password"
          placeholder="At least 8 characters"
          minLength={8}
          required
          className={inputClass}
        />
        <p className="text-xs text-faint">Use 8 or more characters.</p>
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
        {pending ? "Creating account…" : "Create account"}
      </button>

      <p className="mt-1 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href="/login" className={linkClass}>
          Sign in
        </Link>
      </p>
    </form>
  );
}
