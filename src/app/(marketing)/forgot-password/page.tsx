import type { Metadata } from "next";

import { AuthShell } from "@/components/auth-shell";

import { ForgotPasswordForm } from "./forgot-password-form";

export const metadata: Metadata = { title: "Forgot password | MBAProf Tests" };

const POINTS = [
  "We email you a secure reset link",
  "The link works once and expires soon",
  "Your tests and results stay exactly as they were",
];

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      headline={
        <>
          Locked out? <span className="text-brand-gold">Easy fix.</span>
        </>
      }
      points={POINTS}
    >
      <h1 className="text-2xl font-bold text-brand-navy">Forgot your password?</h1>
      <p className="mt-1 text-sm text-brand-ink/70">
        Enter your email and we&apos;ll send you a link to reset it.
      </p>

      <div className="mt-8">
        <ForgotPasswordForm />
      </div>
    </AuthShell>
  );
}
