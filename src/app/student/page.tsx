import Link from "next/link";

import { auth } from "@/auth";
import { formatMarks, markingSummary } from "@/lib/marking";
import { prisma } from "@/lib/prisma";
import { getPublishedTests } from "@/lib/tests-data";

import { startAttempt } from "./actions";
import { StartTestButton } from "./start-test-button";

export default async function StudentDashboardPage() {
  const session = await auth();
  const studentId = session!.user.id;

  // One parallel step (each database round trip is slow from the host, so
  // sequential queries add up): the student's own attempts are filtered to
  // their exam's tests in memory below.
  const [student, tests, attempts] = await Promise.all([
    prisma.user.findUnique({
      where: { id: studentId },
      select: { targetExam: true },
    }),
    getPublishedTests(),
    prisma.testAttempt.findMany({
      where: { studentId },
      orderBy: { startedAt: "desc" },
    }),
  ]);
  const myExam = student?.targetExam ?? null;

  const myExamTests = myExam ? tests.filter((t) => t.targetExam === myExam) : tests;

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">Available tests</h1>
          <p className="mt-1 text-sm text-brand-ink/60">
            Pick a test below and take it under a live timer.
          </p>
        </div>
        <Link
          href="/student/attempts"
          className="whitespace-nowrap rounded-md border border-brand-navy/20 px-4 py-2 text-sm font-semibold text-brand-navy transition-colors hover:bg-brand-navy hover:text-white"
        >
          Attempted tests
        </Link>
      </div>
      {myExam && (
        <p className="mt-2 text-sm text-brand-ink/70">
          Showing tests for{" "}
          <span className="font-semibold text-brand-navy">{myExam}</span>,
          the exam you registered for.
        </p>
      )}

      {myExamTests.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-brand-navy/20 bg-white p-10 text-center text-brand-ink/60">
          {myExam
            ? `No ${myExam} tests are published yet - check back soon.`
            : "No tests are published yet - check back soon."}
        </div>
      ) : (
        <div className="mt-8 space-y-6">
          {myExamTests.map((test) => {
            const testAttempts = attempts.filter((a) => a.testId === test.id);
            const inProgress = testAttempts.find((a) => !a.submittedAt);
            const completed = testAttempts.filter((a) => a.submittedAt);
            const questionCount = test.sections.reduce(
              (sum, s) => sum + s._count.questions,
              0
            );

            return (
              <div key={test.id} className="rounded-xl border border-black/5 bg-white p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-semibold text-brand-navy">
                        {test.title}
                      </h2>
                      <span className="rounded-full bg-brand-gold/15 px-2.5 py-0.5 text-xs font-semibold text-brand-gold">
                        {test.targetExam}
                      </span>
                    </div>
                    {test.description && (
                      <p className="mt-1 text-sm text-brand-ink/70">
                        {test.description}
                      </p>
                    )}
                    <p className="mt-2 text-xs text-brand-ink/50">
                      {questionCount} questions · {test.sections.length}{" "}
                      sections · {test.durationMinutes} min
                      {markingSummary(test.targetExam) && " · negative marking"}
                    </p>
                  </div>

                  <form action={startAttempt.bind(null, test.id)}>
                    <StartTestButton
                      label={inProgress ? "Resume test" : "Start test"}
                    />
                  </form>
                </div>

                {completed.length > 0 && (
                  <div className="mt-4 border-t border-black/5 pt-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-brand-ink/50">
                      Your attempts
                    </p>
                    <ul className="mt-2 space-y-1">
                      {completed.map((attempt, index) => (
                        <li key={attempt.id} className="text-sm">
                          <Link
                            href={`/student/attempts/${attempt.id}/results`}
                            className="text-brand-navy hover:text-brand-gold hover:underline"
                          >
                            Attempt {completed.length - index}: {formatMarks(attempt.score ?? 0)}/
                            {attempt.totalMarks}
                          </Link>{" "}
                          <span className="text-brand-ink/40">
                            {attempt.submittedAt?.toLocaleDateString()}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
