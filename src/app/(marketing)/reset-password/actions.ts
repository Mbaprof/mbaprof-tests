"use server";

import { createHash } from "node:crypto";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { resetPasswordSchema } from "@/lib/validation";

export type ResetPasswordState = { error?: string } | undefined;

export async function resetPassword(
  token: string,
  password: string
): Promise<ResetPasswordState> {
  const parsed = resetPasswordSchema.safeParse({ token, password });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const tokenHash = createHash("sha256").update(parsed.data.token).digest("hex");
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
  });

  if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
    return { error: "This reset link is invalid or has expired. Request a new one." };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() },
    }),
  ]);

  redirect("/login?reset=1");
}
