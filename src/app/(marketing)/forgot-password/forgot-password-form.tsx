"use client";

import Link from "next/link";
import { useActionState } from "react";

import { requestPasswordReset } from "./actions";

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(requestPasswordReset, undefined);

  if (state?.success) {
    return (
      <div className="rounded-md bg-brand-cream px-4 py-3 text-sm text-brand-navy">
        If an account exists for that email, we&apos;ve sent a password
        reset link - check your inbox.
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
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

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-brand-navy px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-navy-light disabled:opacity-60"
      >
        {pending ? "Sending..." : "Send reset link"}
      </button>

      <p className="text-center text-sm text-brand-ink/70">
        <Link href="/login" className="font-medium text-brand-navy hover:text-brand-gold">
          Back to login
        </Link>
      </p>
    </form>
  );
}
