"use client";

import { useState, type FormEvent } from "react";

import { resetPassword } from "./actions";

const inputClass =
  "mt-1 w-full rounded-md border border-black/10 px-3 py-2 text-sm focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy";

export function ResetPasswordForm({ token }: { token: string }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword");

    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setPending(true);
    const result = await resetPassword(token, password);
    if (result?.error) {
      setError(result.error);
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-brand-ink">
          New password
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            minLength={8}
            autoComplete="new-password"
            className={`${inputClass} pr-16`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute inset-y-0 right-0 px-3 text-xs font-medium text-brand-navy hover:text-brand-gold"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
        <p className="mt-1 text-xs text-brand-ink/50">At least 8 characters.</p>
      </div>

      <div>
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-medium text-brand-ink"
        >
          Confirm new password
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type={showPassword ? "text" : "password"}
          required
          minLength={8}
          autoComplete="new-password"
          className={inputClass}
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-brand-navy px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-navy-light disabled:opacity-60"
      >
        {pending ? "Resetting..." : "Reset password"}
      </button>
    </form>
  );
}
