import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { negativeRatioFor } from "@/lib/marking";
import { prisma } from "@/lib/prisma";
import { getTestForExam } from "@/lib/test-stats";

import { submitAttempt } from "./actions";
import { ExamRunner, type ExamData } from "./exam-runner";

export default async function ExamPage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const { attemptId } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const attempt = await prisma.testAttempt.findUnique({
    where: { id: attemptId },
  });

  if (!attempt || attempt.studentId !== session.user.id) {
    notFound();
  }

  if (attempt.submittedAt) {
    redirect(`/student/attempts/${attemptId}/results`);
  }

  // The paper is cached (it only changes when a test is edited) and the
  // student's saved answers are read alongside it - one round trip, not three.
  const [test, existingAnswers] = await Promise.all([
    getTestForExam(attempt.testId),
    prisma.answer.findMany({
      where: { attemptId },
      select: { questionId: true, selectedOptionId: true, timeSpentSeconds: true },
    }),
  ]);

  if (!test) notFound();

  const deadline = attempt.startedAt.getTime() + test.durationMinutes * 60_000;
  if (Date.now() > deadline) {
    const { redirectTo } = await submitAttempt(attemptId);
    redirect(redirectTo);
  }

  const examData: ExamData = {
    attemptId,
    testTitle: test.title,
    studentName: session.user.name ?? "Student",
    durationMinutes: test.durationMinutes,
    negativeRatio: negativeRatioFor(test.targetExam),
    startedAtMs: attempt.startedAt.getTime(),
    sections: test.sections,
    initialAnswers: Object.fromEntries(
      existingAnswers
        .filter((a) => a.selectedOptionId)
        .map((a) => [a.questionId, a.selectedOptionId as string])
    ),
    initialTimeSpent: Object.fromEntries(
      existingAnswers.map((a) => [a.questionId, a.timeSpentSeconds])
    ),
  };

  return <ExamRunner data={examData} />;
}
