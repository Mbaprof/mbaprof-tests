import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { istDateTime } from "@/lib/admin";
import { formatMarks } from "@/lib/marking";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Test results | MBAProf Tests" };

export default async function TestResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const test = await prisma.test.findUnique({
    where: { id },
    include: {
      attempts: {
        where: { submittedAt: { not: null } },
        orderBy: { score: "desc" },
        include: { student: { select: { name: true, email: true } } },
      },
    },
  });

  if (!test) {
    notFound();
  }

  const scores = test.attempts.map((a) => a.score ?? 0);
  const average = scores.length
    ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10
    : 0;
  const highest = scores.length ? Math.max(...scores) : 0;

  return (
    <div>
      <Link href="/admin/tests" className="text-sm text-brand-navy hover:underline">
        ← Back to tests
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-brand-navy">{test.title}</h1>
      <p className="mt-1 text-sm text-brand-ink/60">
        {test.attempts.length} completed attempt
        {test.attempts.length === 1 ? "" : "s"}
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-black/5 bg-white p-5">
          <p className="text-xs uppercase tracking-wide text-brand-ink/50">
            Attempts
          </p>
          <p className="mt-1 text-2xl font-bold text-brand-navy">
            {test.attempts.length}
          </p>
        </div>
        <div className="rounded-xl border border-black/5 bg-white p-5">
          <p className="text-xs uppercase tracking-wide text-brand-ink/50">
            Average score
          </p>
          <p className="mt-1 text-2xl font-bold text-brand-navy">{formatMarks(average)}</p>
        </div>
        <div className="rounded-xl border border-black/5 bg-white p-5">
          <p className="text-xs uppercase tracking-wide text-brand-ink/50">
            Highest score
          </p>
          <p className="mt-1 text-2xl font-bold text-brand-navy">{formatMarks(highest)}</p>
        </div>
      </div>

      {test.attempts.length === 0 ? (
        <div className="mt-10 rounded-xl border border-dashed border-brand-navy/20 bg-white p-10 text-center text-brand-ink/60">
          No students have completed this test yet.
        </div>
      ) : (
        <div className="mt-8 overflow-hidden rounded-xl border border-black/5 bg-white">
          <ul className="divide-y divide-black/5 md:hidden">
            {test.attempts.map((attempt, index) => {
              const scoreValue = attempt.score ?? 0;
              const below = scores.filter((s) => s < scoreValue).length;
              const percentile = scores.length
                ? Math.round((below / scores.length) * 1000) / 10
                : 0;
              return (
                <li key={attempt.id} className="flex items-start gap-3 p-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-navy text-xs font-semibold text-white">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-brand-navy">
                      {attempt.student.name}
                    </p>
                    <p className="break-all text-xs text-brand-ink/50">
                      {attempt.student.email}
                    </p>
                    <p className="mt-2 text-sm text-brand-ink/80">
                      <span className="font-semibold text-brand-navy">
                        {formatMarks(attempt.score ?? 0)} / {attempt.totalMarks}
                      </span>
                      {" · "}
                      {percentile}th percentile
                    </p>
                    <p className="mt-0.5 text-xs text-brand-ink/50">
                      {attempt.submittedAt ? istDateTime.format(attempt.submittedAt) : "-"}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="border-b border-black/5 bg-brand-cream/60 text-xs uppercase tracking-wide text-brand-ink/50">
              <tr>
                <th className="px-5 py-3 font-medium">Rank</th>
                <th className="px-5 py-3 font-medium">Student</th>
                <th className="px-5 py-3 font-medium">Score</th>
                <th className="px-5 py-3 font-medium">Percentile</th>
                <th className="px-5 py-3 font-medium">Submitted</th>
              </tr>
            </thead>
            <tbody>
              {test.attempts.map((attempt, index) => {
                const scoreValue = attempt.score ?? 0;
                const below = scores.filter((s) => s < scoreValue).length;
                const percentile = scores.length
                  ? Math.round((below / scores.length) * 1000) / 10
                  : 0;
                return (
                  <tr key={attempt.id} className="border-b border-black/5 last:border-0">
                    <td className="px-5 py-4 text-brand-ink/70">{index + 1}</td>
                    <td className="px-5 py-4">
                      <p className="font-medium text-brand-navy">
                        {attempt.student.name}
                      </p>
                      <p className="text-xs text-brand-ink/50">
                        {attempt.student.email}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-brand-ink/70">
                      {formatMarks(attempt.score ?? 0)} / {attempt.totalMarks}
                    </td>
                    <td className="px-5 py-4 text-brand-ink/70">
                      {percentile}th
                    </td>
                    <td className="px-5 py-4 text-brand-ink/70">
                      {attempt.submittedAt ? istDateTime.format(attempt.submittedAt) : "-"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </div>
  );
}
