"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { difficultyByQuestion, getQuestionStats, getTestForResults } from "@/lib/test-stats";

export type ReviewQuestion = {
  id: string;
  index: number;
  text: string;
  imageUrl: string | null;
  explanation: string | null;
  passage: { id: string; title: string | null; text: string } | null;
  options: { id: string; text: string; imageUrl: string | null; isCorrect: boolean }[];
  selectedOptionId: string | null;
  difficulty: number | null;
};

// The full question-by-question review (text, options, explanations). Loaded
// only when a student opens it, instead of being built for every results view.
export async function loadReview(attemptId: string): Promise<ReviewQuestion[]> {
  const session = await auth();
  if (!session?.user) throw new Error("Please sign in again.");

  const attempt = await prisma.testAttempt.findUnique({
    where: { id: attemptId },
    select: { studentId: true, testId: true, submittedAt: true },
  });
  if (!attempt || attempt.studentId !== session.user.id || !attempt.submittedAt) {
    throw new Error("Attempt not found");
  }

  const [test, answers, stats] = await Promise.all([
    getTestForResults(attempt.testId),
    prisma.answer.findMany({
      where: { attemptId },
      select: { questionId: true, selectedOptionId: true },
    }),
    getQuestionStats(attempt.testId),
  ]);
  if (!test) throw new Error("Test not found");

  const selected = new Map(answers.map((a) => [a.questionId, a.selectedOptionId]));
  const questions = test.sections.flatMap((s) => s.questions);
  const difficulty = difficultyByQuestion(
    stats,
    new Map(questions.map((q) => [q.id, q.options.find((o) => o.isCorrect)?.id])),
    questions.map((q) => q.id)
  );

  return questions.map((q, index) => ({
    id: q.id,
    index,
    text: q.text,
    imageUrl: q.imageUrl,
    explanation: q.explanation,
    passage: q.passage ? { id: q.passage.id, title: q.passage.title, text: q.passage.text } : null,
    options: q.options.map((o) => ({ id: o.id, text: o.text, imageUrl: o.imageUrl, isCorrect: o.isCorrect })),
    selectedOptionId: selected.get(q.id) ?? null,
    difficulty: difficulty.get(q.id) ?? null,
  }));
}
