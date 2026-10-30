import type { Metadata } from "next";

import { AuthShell } from "@/components/auth-shell";

import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Log in | MBAProf Tests" };

const POINTS = [
  "Timed full-length and sectional mock tests",
  "Percentile and section-wise analysis",
  "Question-by-question review after every test",
];

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ registered?: string; reset?: string }>;
}) {
  const params = await searchParams;

  return (
    <AuthShell
      headline={
        <>
          Practice like it&apos;s <span className="text-brand-gold">exam day.</span>
        </>
      }
      points={POINTS}
    >
      <h1 className="text-2xl font-bold text-brand-navy">Welcome back</h1>
      <p className="mt-1 text-sm text-brand-ink/70">
        Sign in to take tests and review your analysis.
      </p>

      <div className="mt-8">
        <LoginForm
          registered={params.registered === "1"}
          reset={params.reset === "1"}
        />
      </div>
    </AuthShell>
  );
}
