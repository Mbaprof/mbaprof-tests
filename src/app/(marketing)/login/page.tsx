import type { Metadata } from "next";

import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Log in | MBAProf Tests" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ registered?: string; reset?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16 sm:px-6">
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
    </div>
  );
}
