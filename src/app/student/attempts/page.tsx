import Link from "next/link";

import { auth } from "@/auth";
import { formatMarks } from "@/lib/marking";
import { prisma } from "@/lib/prisma";

export default async function AttemptedTestsPage() {
  const session = await auth();
  const studentId = session!.user.id;

  const attempts = await prisma.testAttempt.findMany({
    where: { studentId, submittedAt: { not: null } },
    orderBy: { submittedAt: "desc" },
    include: { test: { select: { title: true, targetExam: true } } },
  });

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">Attempted tests</h1>
          <p className="mt-1 text-sm text-brand-ink/60">
            Every test you&apos;ve submitted, with your score.
          </p>
        </div>
        <Link
          href="/student"
          className="whitespace-nowrap text-sm font-medium text-brand-navy hover:text-brand-gold-dark"
        >
          Back to tests
        </Link>
      </div>

      {attempts.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-brand-navy/20 bg-white p-10 text-center text-brand-ink/60">
          You haven&apos;t submitted any tests yet.
        </div>
      ) : (
        <div className="mt-8 overflow-hidden rounded-xl border border-black/5 bg-white">
          <ul className="divide-y divide-black/5">
            {attempts.map((attempt) => (
              <li key={attempt.id}>
                <Link
                  href={`/student/attempts/${attempt.id}/results`}
                  className="flex flex-wrap items-center justify-between gap-2 px-6 py-4 transition-colors hover:bg-brand-cream"
                >
                  <div>
                    <p className="text-sm font-semibold text-brand-navy">
                      {attempt.test.title}
                    </p>
                    <p className="mt-0.5 text-xs text-brand-ink/50">
                      {attempt.test.targetExam} ·{" "}
                      {attempt.submittedAt?.toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-brand-navy">
                    {formatMarks(attempt.score ?? 0)}/{attempt.totalMarks}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
