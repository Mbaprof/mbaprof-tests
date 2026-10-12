import { unstable_cache } from "next/cache";
import type { PrismaClient } from "@prisma/client";

import { prisma } from "@/lib/prisma";

// Everything the results page and the submit action need to know about a TEST
// (as opposed to one student's attempt). It used to be loaded in full for
// every single request - every student's answers, the whole question paper -
// which grows with the number of students and collapsed under load. Now:
//   - totals are computed by the database (a few hundred rows, not tens of
//     thousands) and cached for a short time,
//   - percentile and rank are plain COUNT queries,
//   - the question paper / answer key is cached until the test is edited
//     (admin edits call revalidateTag("tests")).

type Db = Pick<PrismaClient, "answer" | "testAttempt">;

// ---- plain database queries (also used directly by loadtest checks) --------

// How many submitted attempts picked each option of each question.
export async function queryQuestionStats(db: Db, testId: string) {
  const rows = await db.answer.groupBy({
    by: ["questionId", "selectedOptionId"],
    where: {
      selectedOptionId: { not: null },
      attempt: { testId, submittedAt: { not: null } },
    },
    _count: { _all: true },
  });
  return rows.map((r) => ({
    questionId: r.questionId,
    optionId: r.selectedOptionId as string,
    count: r._count._all,
  }));
}

// Top of the leaderboard: highest score first, earliest submission wins ties.
export async function queryLeaderboardTop(db: Db, testId: string, take = 10) {
  const rows = await db.testAttempt.findMany({
    where: { testId, submittedAt: { not: null } },
    orderBy: [{ score: "desc" }, { submittedAt: "asc" }],
    take,
    select: { id: true, score: true, studentId: true, student: { select: { name: true } } },
  });
  return rows.map((r) => ({
    attemptId: r.id,
    score: r.score ?? 0,
    studentId: r.studentId,
    name: r.student.name,
  }));
}

// Where one submitted attempt stands among everyone who submitted this test.
export async function queryStanding(db: Db, testId: string, myScore: number, mySubmittedAt: Date) {
  const submitted = { testId, submittedAt: { not: null } };
  const [total, below, above, tiedEarlier] = await Promise.all([
    db.testAttempt.count({ where: submitted }),
    // an attempt with no stored score counts as 0
    db.testAttempt.count({
      where: { ...submitted, OR: [{ score: { lt: myScore } }, ...(myScore > 0 ? [{ score: null }] : [])] },
    }),
    db.testAttempt.count({ where: { ...submitted, score: { gt: myScore } } }),
    db.testAttempt.count({
      where: { testId, score: myScore, submittedAt: { not: null, lt: mySubmittedAt } },
    }),
  ]);
  return {
    total,
    percentile: total ? Math.round((below / total) * 1000) / 10 : 0,
    rank: above + tiedEarlier + 1,
  };
}

// Difficulty % per question: wrong answers / attempts that answered it.
export function difficultyByQuestion(
  stats: { questionId: string; optionId: string; count: number }[],
  correctOptionIdByQuestion: Map<string, string | undefined>,
  questionIds: string[]
) {
  const attempted = new Map<string, number>();
  const correct = new Map<string, number>();
  for (const s of stats) {
    attempted.set(s.questionId, (attempted.get(s.questionId) ?? 0) + s.count);
    if (s.optionId === correctOptionIdByQuestion.get(s.questionId)) {
      correct.set(s.questionId, (correct.get(s.questionId) ?? 0) + s.count);
    }
  }
  return new Map<string, number | null>(
    questionIds.map((id) => {
      const total = attempted.get(id) ?? 0;
      const wrong = total - (correct.get(id) ?? 0);
      return [id, total > 0 ? Math.round((wrong / total) * 100) : null];
    })
  );
}

// ---- cached versions used by the pages ---------------------------------------

export function getQuestionStats(testId: string) {
  return unstable_cache(() => queryQuestionStats(prisma, testId), ["question-stats", testId], {
    revalidate: 60,
    tags: [`test-stats-${testId}`],
  })();
}

export function getLeaderboardTop(testId: string) {
  return unstable_cache(() => queryLeaderboardTop(prisma, testId), ["leaderboard-top", testId], {
    revalidate: 30,
    tags: [`test-stats-${testId}`],
  })();
}

// The whole question paper with answers and explanations, for the results page.
export function getTestForResults(testId: string) {
  return unstable_cache(
    () =>
      prisma.test.findUnique({
        where: { id: testId },
        include: {
          sections: {
            orderBy: { order: "asc" },
            include: {
              questions: {
                orderBy: { order: "asc" },
                include: {
                  options: { orderBy: { order: "asc" } },
                  passage: { select: { id: true, title: true, text: true } },
                },
              },
            },
          },
        },
      }),
    ["test-for-results", testId],
    { revalidate: 120, tags: ["tests"] }
  )();
}

// Just what grading needs: which option is right for each question.
export function getAnswerKey(testId: string) {
  return unstable_cache(
    () =>
      prisma.test.findUnique({
        where: { id: testId },
        select: {
          targetExam: true,
          sections: {
            select: {
              questions: {
                select: {
                  id: true,
                  marks: true,
                  options: { select: { id: true, isCorrect: true } },
                },
              },
            },
          },
        },
      }),
    ["answer-key", testId],
    { revalidate: 120, tags: ["tests"] }
  )();
}

// A slim copy of the paper for the results page's SUMMARY (scores, sections,
// topics, difficulty): ids, marks, topics and which option is correct - no
// question text, passages or explanations. The full text is only loaded on
// demand when a student opens the answer review.
export function getTestForResultsSummary(testId: string) {
  return unstable_cache(
    () =>
      prisma.test.findUnique({
        where: { id: testId },
        select: {
          id: true,
          title: true,
          targetExam: true,
          sections: {
            orderBy: { order: "asc" },
            select: {
              id: true,
              name: true,
              questions: {
                orderBy: { order: "asc" },
                select: {
                  id: true,
                  marks: true,
                  topic: true,
                  options: { orderBy: { order: "asc" }, select: { id: true, isCorrect: true } },
                },
              },
            },
          },
        },
      }),
    ["test-for-results-summary", testId],
    { revalidate: 120, tags: ["tests"] }
  )();
}
