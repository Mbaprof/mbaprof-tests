import type { Metadata } from "next";

import { RegisterForm } from "./register-form";

export const metadata: Metadata = { title: "Create account | MBAProf Tests" };

export default function RegisterPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16 sm:px-6">
      <h1 className="text-2xl font-bold text-brand-navy">Create your account</h1>
      <p className="mt-1 text-sm text-brand-ink/70">
        Start taking MBA entrance exam mock tests and track your percentile.
      </p>

      <div className="mt-8">
        <RegisterForm />
      </div>
    </div>
  );
}
