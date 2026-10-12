"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import { loginAction } from "./actions";

export function LoginForm({
  registered,
  reset,
}: {
  registered: boolean;
  reset?: boolean;
}) {
  const [state, formAction, pending] = useActionState(loginAction, undefined);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={formAction} className="space-y-4">
      {registered && (
        <p className="rounded-md bg-brand-cream px-4 py-3 text-sm text-brand-navy">
          Account created - sign in below.
        </p>
      )}
      {reset && (
        <p className="rounded-md bg-brand-cream px-4 py-3 text-sm text-brand-navy">
          Password reset - sign in with your new password.
        </p>
      )}
      {state?.error && (
        <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-brand-ink">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="mt-1 w-full rounded-md border border-black/10 px-3 py-2 text-sm focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy"
        />
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="block text-sm font-medium text-brand-ink">
            Password
          </label>
          <Link
            href="/forgot-password"
            className="text-xs font-medium text-brand-navy hover:text-brand-gold"
          >
            Forgot password?
          </Link>
        </div>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="current-password"
            className="mt-1 w-full rounded-md border border-black/10 px-3 py-2 pr-16 text-sm focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute inset-y-0 right-0 px-3 text-xs font-medium text-brand-navy hover:text-brand-gold"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-brand-navy px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-navy-light disabled:opacity-60"
      >
        {pending ? "Signing in..." : "Sign in"}
      </button>

      <p className="text-center text-sm text-brand-ink/70">
        New here?{" "}
        <Link href="/register" className="font-medium text-brand-navy hover:text-brand-gold">
          Create an account
        </Link>
      </p>
    </form>
  );
}
