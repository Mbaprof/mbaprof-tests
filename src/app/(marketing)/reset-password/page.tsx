import type { Metadata } from "next";
import Link from "next/link";

import { ResetPasswordForm } from "./reset-password-form";

export const metadata: Metadata = { title: "Reset password | MBAProf Tests" };

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16 sm:px-6">
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
            className="font-medium text-brand-navy hover:text-brand-gold"
          >
            Request a new one
          </Link>
          .
        </p>
      )}
    </div>
  );
}
