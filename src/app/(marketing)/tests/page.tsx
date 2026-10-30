import type { Metadata } from "next";

import { auth } from "@/auth";
import { getPublishedTests } from "@/lib/tests-data";

import { TestsBrowser, type TestSummary } from "./tests-browser";

export const metadata: Metadata = {
  title: "Mock Tests | MBAProf Tests",
  description:
    "Browse timed mock tests for CAT, MAH-CET, MAT, ATMA, and more - filter by entrance exam and start practicing.",
};
export default async function TestsPage() {
  const session = await auth();

  const tests = await getPublishedTests();

  const testSummaries: TestSummary[] = tests.map((test) => ({
    id: test.id,
    title: test.title,
    description: test.description,
    targetExam: test.targetExam,
    testType: test.testType,
    durationMinutes: test.durationMinutes,
    questionCount: test.sections.reduce((sum, s) => sum + s._count.questions, 0),
    sectionCount: test.sections.length,
    isFreePreview: test.isFreePreview,
  }));

  return (
    <div>
      <section
        className="bg-brand-navy px-4 py-14 text-white sm:px-6 sm:py-16"
        style={{
          backgroundImage:
            "radial-gradient(640px 300px at 90% -20%, rgba(244,176,39,0.22), transparent 65%), radial-gradient(520px 260px at -5% 120%, rgba(38,74,118,0.55), transparent 70%)",
        }}
      >
        <div className="mx-auto max-w-5xl">
          <p className="heading-flag text-xs font-bold uppercase tracking-[0.14em] text-brand-gold-light">
            Mock Tests
          </p>
          <h1 className="mt-3 max-w-2xl text-balance text-3xl font-extrabold leading-tight sm:text-4xl">
            Pick your exam. <span className="text-brand-gold">Start practicing.</span>
          </h1>
          <p className="mt-3 max-w-2xl text-brand-grey-cool">
            Every mock and sectional test on MBAProf Tests, filterable by
            entrance exam - pick yours from the dropdown below.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-12">
        <TestsBrowser tests={testSummaries} isAuthenticated={!!session?.user} />
      </div>
    </div>
  );
}
