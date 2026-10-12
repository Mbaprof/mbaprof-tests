"use server";

import { createHash, randomBytes } from "node:crypto";
import { headers } from "next/headers";

import { sendPasswordResetEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { forgotPasswordSchema } from "@/lib/validation";

export type ForgotPasswordState = { error?: string; success?: boolean } | undefined;

async function getBaseUrl() {
  const h = await headers();
  const host = h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}

export async function requestPasswordReset(
  _prevState: ForgotPasswordState,
  formData: FormData
): Promise<ForgotPasswordState> {
  const parsed = forgotPasswordSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { error: "Enter a valid email address." };
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });

  if (user) {
    // Invalidate any earlier unused tokens so only the newest link works.
    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id, usedAt: null },
    });

    const rawToken = randomBytes(32).toString("hex");
    const tokenHash = createHash("sha256").update(rawToken).digest("hex");

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    const baseUrl = await getBaseUrl();
    const resetUrl = `${baseUrl}/reset-password?token=${rawToken}`;

    await sendPasswordResetEmail({ name: user.name, email: user.email, resetUrl });
  }

  // Always the same response whether or not the email has an account -
  // otherwise this form could be used to check which emails are registered.
  return { success: true };
}
