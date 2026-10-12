"use server";

import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function startAttempt(testId: string) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const test = await prisma.test.findUnique({ where: { id: testId } });
  if (!test || !test.published) {
    throw new Error("Test not available");
  }

  const existing = await prisma.testAttempt.findFirst({
    where: { testId, studentId: session.user.id, submittedAt: null },
  });

  const attempt =
    existing ??
    (await prisma.testAttempt.create({
      data: { testId, studentId: session.user.id },
    }));

  redirect(`/exam/${attempt.id}`);
}
