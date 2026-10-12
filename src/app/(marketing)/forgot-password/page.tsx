import type { Metadata } from "next";

import { ForgotPasswordForm } from "./forgot-password-form";

export const metadata: Metadata = { title: "Forgot password | MBAProf Tests" };

export default function ForgotPasswordPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16 sm:px-6">
      <h1 className="text-2xl font-bold text-brand-navy">Forgot your password?</h1>
      <p className="mt-1 text-sm text-brand-ink/70">
        Enter your email and we&apos;ll send you a link to reset it.
      </p>

      <div className="mt-8">
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
