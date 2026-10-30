import type { Metadata } from "next";
import Link from "next/link";

import { AuthShell } from "@/components/auth-shell";

import { ResetPasswordForm } from "./reset-password-form";

export const metadata: Metadata = { title: "Reset password | MBAProf Tests" };

const POINTS = [
  "Pick a strong password you will remember",
  "You will be asked to sign in again afterwards",
  "Your tests and results stay exactly as they were",
];

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <AuthShell
      headline={
        <>
          Choose a <span className="text-brand-gold">new password.</span>
        </>
      }
      points={POINTS}
    >
      <h1 className="text-2xl font-bold text-brand-navy">Reset your password</h1>
      {token ? (
        <>
          <p className="mt-1 text-sm text-brand-ink/70">
            Choose a new password below.
          </p>
          <div className="mt-8">
            <ResetPasswordForm token={token} />
          </div>
        </>
      ) : (
        <p className="mt-4 text-sm text-brand-ink/70">
          This link is missing a reset token.{" "}
          <Link
            href="/forgot-password"
            className="font-medium text-brand-navy hover:text-brand-gold-dark"
          >
            Request a new one
          </Link>
          .
        </p>
      )}
    </AuthShell>
  );
}
