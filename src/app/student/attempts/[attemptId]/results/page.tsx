import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import {
  formatMarks,
  markingSummary,
  negativeRatioFor,
  roundMarks,
} from "@/lib/marking";
import { prisma } from "@/lib/prisma";
import {
  difficultyByQuestion as computeDifficulty,
  getLeaderboardTop,
  getQuestionStats,
  getTestForResultsSummary,
  queryLeaderboardTop,
  queryStanding,
} from "@/lib/test-stats";

import { QuestionSummaryTable, type ReviewRow } from "./question-summary-table";
import { ReviewSection } from "./review-section";

export const metadata: Metadata = { title: "Test results | MBAProf Tests" };

export default async function AttemptResultsPage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const { attemptId } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const attempt = await prisma.testAttempt.findUnique({
    where: { id: attemptId },
    include: { student: { select: { name: true } } },
  });

  if (!attempt || attempt.studentId !== session.user.id) {
    notFound();
  }

  if (!attempt.submittedAt) {
    redirect(`/exam/${attemptId}`);
  }

  const [test, answers] = await Promise.all([
    getTestForResultsSummary(attempt.testId),
    prisma.answer.findMany({ where: { attemptId } }),
  ]);

  if (!test) notFound();

  const answerByQuestion = new Map(answers.map((a) => [a.questionId, a]));

  const negativeRatio = negativeRatioFor(test.targetExam);
  const marking = markingSummary(test.targetExam);

  const sectionStats = test.sections.map((section) => {
    let correctMarks = 0;
    let penaltyMarks = 0;
    let sectionTotalMarks = 0;
    let correctCount = 0;
    let wrongCount = 0;
    let answeredCount = 0;

    for (const question of section.questions) {
      sectionTotalMarks += question.marks;
      const answer = answerByQuestion.get(question.id);
      const correctOption = question.options.find((o) => o.isCorrect);
      if (answer?.selectedOptionId) answeredCount += 1;
      if (correctOption && answer?.selectedOptionId === correctOption.id) {
        correctMarks += question.marks;
        correctCount += 1;
      } else if (answer?.selectedOptionId) {
        penaltyMarks += question.marks * negativeRatio;
        wrongCount += 1;
      }
    }

    return {
      id: section.id,
      name: section.name,
      correctMarks: roundMarks(correctMarks - penaltyMarks),
      penaltyMarks: roundMarks(penaltyMarks),
      sectionTotalMarks,
      correctCount,
      wrongCount,
      answeredCount,
      questionCount: section.questions.length,
    };
  });

  const allQuestions = test.sections.flatMap((s) => s.questions);
  const totalSeconds = allQuestions.reduce(
    (sum, q) => sum + (answerByQuestion.get(q.id)?.timeSpentSeconds ?? 0),
    0
  );
  const avgTime = allQuestions.length > 0 ? totalSeconds / allQuestions.length : 0;

  // Difficulty %, percentile, rank and the leaderboard come from database
  // aggregates (cached briefly) instead of loading every student's answers
  // and scores on every view - see src/lib/test-stats.ts.
  const correctOptionIdByQuestion = new Map(
    allQuestions.map((q) => [q.id, q.options.find((o) => o.isCorrect)?.id])
  );
  const myScore = attempt.score ?? 0;
  const [questionStats, cachedTop, standing] = await Promise.all([
    getQuestionStats(test.id),
    getLeaderboardTop(test.id),
    queryStanding(prisma, test.id, myScore, attempt.submittedAt),
  ]);
  const percentile = standing.percentile;
  const myRank = standing.rank;
  const leaderboardCount = standing.total;
  const myName = attempt.student.name;
  const difficultyByQuestion = computeDifficulty(
    questionStats,
    correctOptionIdByQuestion,
    allQuestions.map((q) => q.id)
  );

  // Leaderboard top 10 (cached for 30 s). If this student belongs in it but
  // the cached copy predates their submission, read it fresh instead.
  let topRows = cachedTop;
  if (myRank <= 10 && !topRows.some((r) => r.attemptId === attempt.id)) {
    topRows = await queryLeaderboardTop(prisma, test.id);
  }
  const leaderboardTop = topRows.map((r, index) => ({
    rank: index + 1,
    attemptId: r.attemptId,
    name: r.name,
    score: r.score,
    isMe: r.studentId === session.user.id,
  }));
  const meInTop = leaderboardTop.some((r) => r.isMe);

  // Weak topics — only meaningful for tests whose questions carry topic tags
  // (currently: mocks generated from the question bank). Hand-built tests
  // have no topic data, so this whole section is skipped rather than shown
  // empty or misleading.
  const topicAgg = new Map<string, { correct: number; total: number }>();
  for (const question of allQuestions) {
    if (!question.topic) continue;
    const entry = topicAgg.get(question.topic) ?? { correct: 0, total: 0 };
    entry.total += 1;
    const answer = answerByQuestion.get(question.id);
    const correctOption = question.options.find((o) => o.isCorrect);
    if (answer?.selectedOptionId && answer.selectedOptionId === correctOption?.id) {
      entry.correct += 1;
    }
    topicAgg.set(question.topic, entry);
  }
  const topicStats = [...topicAgg.entries()]
    .map(([topic, { correct, total }]) => ({
      topic,
      correct,
      total,
      accuracy: Math.round((correct / total) * 100),
    }))
    .sort((a, b) => a.accuracy - b.accuracy);
  const weakTopics = topicStats.filter((t) => t.accuracy < 60);

  // Recommended action — a few rule-based, plain-language suggestions
  // derived from section accuracy, topic accuracy (if available), and
  // pacing (how much got left unattempted).
  const sectionsWithAccuracy = sectionStats.map((s) => ({
    ...s,
    accuracy: s.questionCount > 0 ? Math.round((s.correctCount / s.questionCount) * 100) : 0,
  }));
  const weakestSection = [...sectionsWithAccuracy].sort((a, b) => a.accuracy - b.accuracy)[0];
  const recommendations: string[] = [];
  if (weakestSection && sectionsWithAccuracy.length > 1) {
    recommendations.push(
      `${weakestSection.name} is your weakest section at ${weakestSection.accuracy}% accuracy (${weakestSection.correctCount}/${weakestSection.questionCount} correct) - spend your next study block there before moving on.`
    );
  }
  if (weakTopics.length > 0) {
    const worst = weakTopics[0];
    recommendations.push(
      `Within that, "${worst.topic}" stands out at just ${worst.accuracy}% accuracy (${worst.correct}/${worst.total}) - worth targeted practice on this topic specifically.`
    );
  }
  const unattemptedCount = allQuestions.filter(
    (q) => !answerByQuestion.get(q.id)?.selectedOptionId
  ).length;
  if (allQuestions.length > 0 && unattemptedCount / allQuestions.length > 0.15) {
    recommendations.push(
      `You left ${unattemptedCount} question(s) unattempted - if that wasn't intentional, work on pacing so you reach every question next time.`
    );
  }
  if (recommendations.length === 0) {
    recommendations.push(
      "Solid, even performance across sections - no single weak spot to flag. Keep practicing at this pace and watch your percentile trend over your next few mocks."
    );
  }

  const correctQuestions: ReviewRow[] = [];
  const incorrectQuestions: ReviewRow[] = [];
  const notAttemptedQuestions: ReviewRow[] = [];
  allQuestions.forEach((question, index) => {
    const answer = answerByQuestion.get(question.id);
    const correctOption = question.options.find((o) => o.isCorrect);
    const entry: ReviewRow = {
      index,
      id: question.id,
      difficulty: difficultyByQuestion.get(question.id) ?? null,
      seconds: answer?.timeSpentSeconds ?? 0,
    };
    if (!answer?.selectedOptionId) {
      notAttemptedQuestions.push(entry);
    } else if (answer.selectedOptionId === correctOption?.id) {
      correctQuestions.push(entry);
    } else {
      incorrectQuestions.push(entry);
    }
  });

  return (
    <div>
      <Link href="/student" className="text-sm text-brand-navy hover:underline">
        ← Back to dashboard
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-brand-navy">{test.title}</h1>
      <p className="mt-1 text-sm text-brand-ink/60">
        Submitted {attempt.submittedAt?.toLocaleString()}
      </p>

      {/* Overview */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-black/5 bg-white p-5">
          <p className="text-xs uppercase tracking-wide text-brand-ink/50">Score</p>
          <p className="mt-1 text-2xl font-bold text-brand-navy">
            {formatMarks(attempt.score ?? 0)} / {attempt.totalMarks}
          </p>
        </div>
        <div className="rounded-xl border border-black/5 bg-white p-5">
          <p className="text-xs uppercase tracking-wide text-brand-ink/50">
            Percentile
          </p>
          <p className="mt-1 text-2xl font-bold text-brand-gold-dark">
            {percentile}th
          </p>
        </div>
        <div className="rounded-xl border border-black/5 bg-white p-5">
          <p className="text-xs uppercase tracking-wide text-brand-ink/50">
            Accuracy
          </p>
          <p className="mt-1 text-2xl font-bold text-brand-navy">
            {allQuestions.length > 0
              ? Math.round(
                  (sectionStats.reduce((s, sec) => s + sec.correctCount, 0) /
                    allQuestions.length) *
                    100
                )
              : 0}
            %
          </p>
        </div>
      </div>

      {marking && (
        <p className="mt-3 text-xs text-brand-ink/60">
          Negative marking applies to this test: {marking}.
        </p>
      )}

      {/* Recommended action */}
      <section className="mt-10 rounded-xl border border-brand-gold/30 bg-brand-cream/40 p-5">
        <h2 className="text-lg font-semibold text-brand-navy">
          Recommended action
        </h2>
        <ul className="mt-3 space-y-2 text-sm text-brand-ink/80">
          {recommendations.map((rec, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-brand-gold">•</span>
              <span>{rec}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Section performance */}
      <section className="mt-10">
        <h2 className="text-lg font-semibold text-brand-navy">
          Section performance
        </h2>
        <div className="mt-4 space-y-4">
          {sectionsWithAccuracy.map((s) => (
            <div
              key={s.id}
              className="rounded-xl border border-black/5 bg-white p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium text-brand-navy">{s.name}</p>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    s.accuracy >= 70
                      ? "bg-green-100 text-green-700"
                      : s.accuracy >= 40
                        ? "bg-amber-100 text-amber-700"
                        : "bg-red-100 text-red-700"
                  }`}
                >
                  {s.accuracy}% accuracy
                </span>
              </div>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-brand-cream">
                <div
                  className={`h-full rounded-full ${
                    s.accuracy >= 70
                      ? "bg-green-500"
                      : s.accuracy >= 40
                        ? "bg-amber-500"
                        : "bg-red-500"
                  }`}
                  style={{ width: `${s.accuracy}%` }}
                />
              </div>
              <div className="mt-3 flex flex-wrap gap-4 text-xs text-brand-ink/60">
                <span>Score: {formatMarks(s.correctMarks)}/{s.sectionTotalMarks}</span>
                <span>Correct: {s.correctCount}/{s.questionCount}</span>
                {s.penaltyMarks > 0 && (
                  <span className="text-red-700">
                    Wrong: {s.wrongCount} (-{formatMarks(s.penaltyMarks)})
                  </span>
                )}
                <span>Attempted: {s.answeredCount}/{s.questionCount}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Weak topics — only shown when this test's questions carry topic tags */}
      {weakTopics.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-semibold text-brand-navy">
            Weak topics
          </h2>
          <p className="mt-1 text-sm text-brand-ink/60">
            Topics where your accuracy fell below 60%.
          </p>
          <div className="mt-4 overflow-x-auto rounded-xl border border-black/5 bg-white">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead className="border-b border-black/5 bg-brand-cream/60 text-xs uppercase tracking-wide text-brand-ink/50">
                <tr>
                  <th className="px-5 py-3 font-medium">Topic</th>
                  <th className="px-5 py-3 font-medium">Accuracy</th>
                  <th className="px-5 py-3 font-medium">Correct</th>
                </tr>
              </thead>
              <tbody>
                {weakTopics.map((t) => (
                  <tr key={t.topic} className="border-b border-black/5 last:border-0">
                    <td className="px-5 py-3 font-medium text-brand-navy">
                      {t.topic}
                    </td>
                    <td className="px-5 py-3 text-red-700">{t.accuracy}%</td>
                    <td className="px-5 py-3 text-brand-ink/70">
                      {t.correct}/{t.total}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Leaderboard */}
      <section className="mt-10">
        <h2 className="text-lg font-semibold text-brand-navy">Leaderboard</h2>
        <p className="mt-1 text-sm text-brand-ink/60">
          Ranked by score among everyone who has taken this test
          {myRank ? ` - you're ranked #${myRank} of ${leaderboardCount}.` : "."}
        </p>
        <div className="mt-4 overflow-x-auto rounded-xl border border-black/5 bg-white">
          <table className="w-full min-w-[380px] text-left text-sm">
            <thead className="border-b border-black/5 bg-brand-cream/60 text-xs uppercase tracking-wide text-brand-ink/50">
              <tr>
                <th className="px-5 py-3 font-medium">Rank</th>
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Score</th>
              </tr>
            </thead>
            <tbody>
              {leaderboardTop.map((row) => (
                <tr
                  key={row.attemptId}
                  className={`border-b border-black/5 last:border-0 ${
                    row.isMe ? "bg-brand-gold/10" : ""
                  }`}
                >
                  <td className="px-5 py-3 font-medium text-brand-navy">
                    #{row.rank}
                  </td>
                  <td className="px-5 py-3 text-brand-ink/70">
                    {row.name}
                    {row.isMe && (
                      <span className="ml-2 rounded-full bg-brand-navy px-2 py-0.5 text-[10px] font-semibold text-white">
                        You
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-brand-ink/70">
                    {formatMarks(row.score)}/{attempt.totalMarks}
                  </td>
                </tr>
              ))}
              {!meInTop && myRank && (
                <tr className="border-t-2 border-dashed border-black/10 bg-brand-gold/10">
                  <td className="px-5 py-3 font-medium text-brand-navy">
                    #{myRank}
                  </td>
                  <td className="px-5 py-3 text-brand-ink/70">
                    {myName}
                    <span className="ml-2 rounded-full bg-brand-navy px-2 py-0.5 text-[10px] font-semibold text-white">
                      You
                    </span>
                  </td>
                  <td className="px-5 py-3 text-brand-ink/70">
                    {formatMarks(myScore)}/{attempt.totalMarks}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Correct / Incorrect / Not attempted */}
      <section className="mt-10">
        <h2 className="text-lg font-semibold text-brand-navy">
          Question breakdown
        </h2>
        <p className="mt-1 text-sm text-brand-ink/60">
          Average: {Math.round(avgTime)}s per question
        </p>
        <div className="mt-4 grid items-start gap-6 sm:grid-cols-3">
          <QuestionSummaryTable
            title="Correct"
            badgeClass="bg-green-100 text-green-700"
            rows={correctQuestions}
            emptyMessage="No correct answers yet."
          />
          <QuestionSummaryTable
            title="Incorrect"
            badgeClass="bg-red-100 text-red-700"
            rows={incorrectQuestions}
            emptyMessage="No incorrect answers - nice."
          />
          <QuestionSummaryTable
            title="Not attempted"
            badgeClass="bg-black/5 text-brand-ink/60"
            rows={notAttemptedQuestions}
            emptyMessage="You attempted every question."
          />
        </div>
      </section>

      {/* Answer review - fetched on demand, drawn in the student's browser */}
      <ReviewSection attemptId={attempt.id} questionCount={allQuestions.length} />
    </div>
  );
}
