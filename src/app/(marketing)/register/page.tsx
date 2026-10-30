import type { Metadata } from "next";

import { AuthShell } from "@/components/auth-shell";

import { RegisterForm } from "./register-form";

export const metadata: Metadata = { title: "Create account | MBAProf Tests" };

const POINTS = [
  "Timed mock tests for your target exam",
  "Percentile and section-wise analysis",
  "Every attempt saved, so you can review it any time",
];

export default function RegisterPage() {
  return (
    <AuthShell
      headline={
        <>
          Start practicing <span className="text-brand-gold">in minutes.</span>
        </>
      }
      points={POINTS}
    >
      <h1 className="text-2xl font-bold text-brand-navy">Create your account</h1>
      <p className="mt-1 text-sm text-brand-ink/70">
        Start taking MBA entrance exam mock tests and track your percentile.
      </p>

      <div className="mt-8">
        <RegisterForm />
      </div>
    </AuthShell>
  );
}
