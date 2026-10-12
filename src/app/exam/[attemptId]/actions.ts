"use server";

import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { negativeRatioFor, scoreAttempt } from "@/lib/marking";
import { prisma } from "@/lib/prisma";
import { getAnswerKey } from "@/lib/test-stats";

async function requireOwnedAttempt(attemptId: string) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const attempt = await prisma.testAttempt.findUnique({
    where: { id: attemptId },
  });
  if (!attempt || attempt.studentId !== session.user.id) {
    throw new Error("Attempt not found");
  }
  return attempt;
}

export async function saveAnswer(
  attemptId: string,
  questionId: string,
  selectedOptionId: string | null | undefined,
  timeDeltaSeconds: number
) {
  const attempt = await requireOwnedAttempt(attemptId);
  if (attempt.submittedAt) return;

  const updateData: {
    timeSpentSeconds: { increment: number };
    selectedOptionId?: string | null;
  } = {
    timeSpentSeconds: { increment: Math.max(0, Math.round(timeDeltaSeconds)) },
  };
  if (selectedOptionId !== undefined) {
    updateData.selectedOptionId = selectedOptionId;
  }

  await prisma.answer.upsert({
    where: { attemptId_questionId: { attemptId, questionId } },
    update: updateData,
    create: {
      attemptId,
      questionId,
      selectedOptionId: selectedOptionId ?? null,
      timeSpentSeconds: Math.max(0, Math.round(timeDeltaSeconds)),
    },
  });
}

// Grades the attempt (once) and says where the results are. It no longer
// redirects: a redirect made the server build the whole results page before
// answering, which is what made submitting slow when many students finished
// together. The browser opens the results page itself instead.
export async function submitAttempt(attemptId: string) {
  const attempt = await requireOwnedAttempt(attemptId);

  if (!attempt.submittedAt) {
    const [test, answers] = await Promise.all([
      getAnswerKey(attempt.testId),
      prisma.answer.findMany({
        where: { attemptId },
        select: { questionId: true, selectedOptionId: true },
      }),
    ]);
    if (!test) throw new Error("Test not found");
    const { score, totalMarks } = scoreAttempt(
      test.sections.flatMap((section) => section.questions),
      new Map(answers.map((a) => [a.questionId, a.selectedOptionId])),
      negativeRatioFor(test.targetExam)
    );

    await prisma.testAttempt.update({
      where: { id: attemptId },
      data: { submittedAt: new Date(), score, totalMarks },
    });
  }

  return { redirectTo: `/student/attempts/${attemptId}/results` };
}
