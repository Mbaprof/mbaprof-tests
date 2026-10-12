import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { negativeRatioFor } from "@/lib/marking";
import { prisma } from "@/lib/prisma";

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

  const test = await prisma.test.findUnique({
    where: { id: attempt.testId },
    select: {
      title: true,
      targetExam: true,
      durationMinutes: true,
      sections: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          name: true,
          questions: {
            orderBy: { order: "asc" },
            select: {
              id: true,
              text: true,
              imageUrl: true,
              marks: true,
              passage: { select: { id: true, title: true, text: true } },
              options: {
                orderBy: { order: "asc" },
                select: { id: true, text: true, imageUrl: true },
              },
            },
          },
        },
      },
    },
  });

  if (!test) notFound();

  const deadline = attempt.startedAt.getTime() + test.durationMinutes * 60_000;
  if (Date.now() > deadline) {
    const { redirectTo } = await submitAttempt(attemptId);
    redirect(redirectTo);
  }

  const existingAnswers = await prisma.answer.findMany({
    where: { attemptId },
    select: { questionId: true, selectedOptionId: true, timeSpentSeconds: true },
  });

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
