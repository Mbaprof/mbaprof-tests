import Link from "next/link";

import { auth } from "@/auth";
import { formatMarks, markingSummary } from "@/lib/marking";
import { prisma } from "@/lib/prisma";
import { isTestType, TEST_TYPES, testTypeShort } from "@/lib/test-types";
import { getPublishedTests } from "@/lib/tests-data";

import { startAttempt } from "./actions";
import { StartTestButton } from "./start-test-button";

export default async function StudentDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
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

  // Type filter (full-length / sectional / diagnostic ...). Only types this
  // student actually has tests in are offered; it is driven by ?type= so it
  // works without JavaScript and survives refresh and the back button.
  const typeOptions = TEST_TYPES.map((t) => ({
    ...t,
    count: myExamTests.filter((x) => x.testType === t.value).length,
  })).filter((t) => t.count > 0);
  const activeType =
    type && isTestType(type) && typeOptions.some((t) => t.value === type)
      ? type
      : null;
  const visibleTests = activeType
    ? myExamTests.filter((t) => t.testType === activeType)
    : myExamTests;
  const chipClass = (active: boolean) =>
    `rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
      active
        ? "bg-brand-navy text-white"
        : "border border-black/10 bg-white text-brand-ink/70 hover:bg-brand-navy/10"
    }`;

  const firstName = (session!.user.name ?? "").trim().split(/\s+/)[0] || "there";
  const submittedCount = attempts.filter((a) => a.submittedAt).length;
  const inProgressCount = attempts.filter((a) => !a.submittedAt).length;
  const stats = [
    { label: "Tests available", value: myExamTests.length },
    { label: "Tests submitted", value: submittedCount },
    { label: "In progress", value: inProgressCount },
  ];

  return (
    <div>
      {/* Welcome banner */}
      <section
        className="relative overflow-hidden rounded-2xl bg-brand-navy p-6 text-white shadow-[0_12px_32px_rgba(11,29,46,0.18)] sm:p-8"
        style={{
          backgroundImage:
            "radial-gradient(520px 260px at 100% 0%, rgba(244,176,39,0.22), transparent 65%), radial-gradient(420px 240px at 0% 120%, rgba(38,74,118,0.55), transparent 70%)",
        }}
      >
        <p className="heading-flag text-xs font-bold uppercase tracking-[0.14em] text-brand-gold-light">
          Your dashboard
        </p>
        <h1 className="mt-3 text-balance text-2xl font-extrabold leading-tight sm:text-3xl">
          Hi {firstName}, ready to practice?
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-brand-grey-cool sm:text-base">
          Pick a test below and take it under a live timer.
          {myExam && (
            <>
              {" "}
              Showing tests for <span className="font-semibold text-white">{myExam}</span>, the exam you
              registered for.
            </>
          )}
        </p>

        <div className="mt-6 grid grid-cols-3 gap-3 sm:max-w-md">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-xl border border-white/10 bg-white/[0.07] px-3 py-3 sm:px-4">
              <p className="text-2xl font-extrabold leading-none text-brand-gold sm:text-3xl">{stat.value}</p>
              <p className="mt-1.5 text-[11px] font-medium leading-tight text-brand-grey-cool sm:text-xs">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/student/lectures"
            className="inline-flex min-h-11 items-center whitespace-nowrap rounded-lg bg-brand-gold px-5 py-2 text-sm font-bold text-brand-navy transition-colors hover:bg-brand-gold-light"
          >
            Live classes
          </Link>
          <Link
            href="/student/attempts"
            className="inline-flex min-h-11 items-center whitespace-nowrap rounded-lg border border-white/30 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10"
          >
            Attempted tests
          </Link>
        </div>
      </section>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-extrabold text-brand-navy">Available tests</h2>
        {typeOptions.length > 1 && (
          <nav aria-label="Filter tests by type" className="flex flex-wrap gap-2">
            <Link
              href="/student"
              scroll={false}
              aria-current={activeType ? undefined : "page"}
              className={chipClass(!activeType)}
            >
              All ({myExamTests.length})
            </Link>
            {typeOptions.map((t) => (
              <Link
                key={t.value}
                href={`/student?type=${t.value}`}
                scroll={false}
                aria-current={activeType === t.value ? "page" : undefined}
                className={chipClass(activeType === t.value)}
              >
                {t.short} ({t.count})
              </Link>
            ))}
          </nav>
        )}
      </div>

      {visibleTests.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-brand-navy/20 bg-white p-10 text-center text-brand-ink/60">
          {myExam
            ? `No ${myExam} tests are published yet - check back soon.`
            : "No tests are published yet - check back soon."}
        </div>
      ) : (
        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          {visibleTests.map((test) => {
            const testAttempts = attempts.filter((a) => a.testId === test.id);
            const inProgress = testAttempts.find((a) => !a.submittedAt);
            const completed = testAttempts.filter((a) => a.submittedAt);
            const questionCount = test.sections.reduce(
              (sum, s) => sum + s._count.questions,
              0
            );

            return (
              <article
                key={test.id}
                className="flex flex-col rounded-2xl border border-black/5 border-t-4 border-t-brand-gold bg-white p-5 shadow-[0_2px_10px_rgba(11,29,46,0.05)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(11,29,46,0.12)] sm:p-6"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-brand-gold/20 px-2.5 py-0.5 text-xs font-semibold text-brand-navy">
                    {test.targetExam}
                  </span>
                  <span className="rounded-full bg-black/5 px-2.5 py-0.5 text-xs font-semibold text-brand-ink/70">
                    {testTypeShort(test.testType)}
                  </span>
                  {inProgress && (
                    <span className="rounded-full bg-brand-navy px-2.5 py-0.5 text-xs font-semibold text-brand-gold">
                      In progress
                    </span>
                  )}
                </div>

                <h3 className="mt-3 text-lg font-extrabold leading-snug text-brand-navy">{test.title}</h3>
                {test.description && (
                  <p className="mt-1.5 line-clamp-3 text-sm leading-relaxed text-brand-ink/70">
                    {test.description}
                  </p>
                )}

                <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5 text-xs font-medium text-brand-ink/60">
                  <li className="flex items-center gap-1.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M9 11l3 3L22 4" />
                      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                    </svg>
                    {questionCount} questions
                  </li>
                  <li className="flex items-center gap-1.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect x="3" y="3" width="18" height="7" rx="1" />
                      <rect x="3" y="14" width="18" height="7" rx="1" />
                    </svg>
                    {test.sections.length} {test.sections.length === 1 ? "section" : "sections"}
                  </li>
                  <li className="flex items-center gap-1.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    {test.durationMinutes} min
                  </li>
                  {markingSummary(test.targetExam) && (
                    <li className="flex items-center gap-1.5">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="8" y1="12" x2="16" y2="12" />
                      </svg>
                      Negative marking
                    </li>
                  )}
                </ul>

                {completed.length > 0 && (
                  <div className="mt-4 border-t border-black/5 pt-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-brand-ink/50">
                      Your attempts
                    </p>
                    <ul className="mt-1.5 space-y-1">
                      {completed.map((attempt, index) => (
                        <li key={attempt.id} className="text-sm">
                          <Link
                            href={`/student/attempts/${attempt.id}/results`}
                            className="font-medium text-brand-navy hover:text-brand-gold-dark hover:underline"
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

                <form action={startAttempt.bind(null, test.id)} className="mt-auto pt-5">
                  <StartTestButton label={inProgress ? "Resume test" : "Start test"} />
                </form>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
