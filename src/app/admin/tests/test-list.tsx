"use client";

import Link from "next/link";
import { useState } from "react";

import { testTypeShort } from "@/lib/test-types";
import { MBA_ENTRANCE_EXAMS } from "@/lib/validation";

import { DeleteTestButton, PublishToggle } from "./test-row-actions";

export type TestRow = {
  id: string;
  title: string;
  targetExam: string;
  testType: string;
  durationMinutes: number;
  published: boolean;
  questionCount: number;
  sectionCount: number;
  attemptCount: number;
};

export function TestList({ tests }: { tests: TestRow[] }) {
  const [activeExam, setActiveExam] = useState<string>("All");

  const examsWithCounts = MBA_ENTRANCE_EXAMS.map((exam) => ({
    exam,
    count: tests.filter((t) => t.targetExam === exam).length,
  }));

  const visibleTests =
    activeExam === "All" ? tests : tests.filter((t) => t.targetExam === activeExam);

  const createHref =
    activeExam === "All"
      ? "/admin/tests/new"
      : `/admin/tests/new?exam=${encodeURIComponent(activeExam)}`;

  const tabClass = (active: boolean) =>
    `cursor-pointer rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
      active
        ? "bg-brand-navy text-white"
        : "bg-white text-brand-ink/70 hover:bg-brand-navy/10"
    }`;

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">Tests</h1>
          <p className="mt-1 text-sm text-brand-ink/60">
            {tests.length} test{tests.length === 1 ? "" : "s"}. Create, edit,
            publish or remove tests here.
          </p>
        </div>
        <Link
          href={createHref}
          className="whitespace-nowrap rounded-md bg-brand-navy px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-navy-light"
        >
          + Create new test
        </Link>
      </div>

      <div
        role="tablist"
        aria-label="Filter tests by entrance exam"
        className="mt-6 flex flex-wrap gap-2"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeExam === "All"}
          onClick={() => setActiveExam("All")}
          className={tabClass(activeExam === "All")}
        >
          All ({tests.length})
        </button>
        {examsWithCounts.map(({ exam, count }) => (
          <button
            key={exam}
            type="button"
            role="tab"
            aria-selected={activeExam === exam}
            onClick={() => setActiveExam(exam)}
            className={tabClass(activeExam === exam)}
          >
            {exam} ({count})
          </button>
        ))}
      </div>

      {visibleTests.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-brand-navy/20 bg-white p-10 text-center">
          <p className="text-brand-ink/70">
            {activeExam === "All"
              ? "No tests have been created yet."
              : `No tests yet for ${activeExam}.`}
          </p>
          <Link
            href={createHref}
            className="mt-4 inline-block rounded-md bg-brand-navy px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-navy-light"
          >
            {activeExam === "All"
              ? "Create your first test"
              : `Create a test for ${activeExam}`}
          </Link>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-xl border border-black/5 bg-white">
          <ul className="divide-y divide-black/5 md:hidden">
            {visibleTests.map((test) => (
              <li key={test.id} className="space-y-3 p-4">
                <div>
                  <p className="font-semibold text-brand-navy">{test.title}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-brand-gold/15 px-2.5 py-0.5 text-xs font-semibold text-brand-gold">
                      {test.targetExam}
                    </span>
                    <span className="rounded-full bg-black/5 px-2.5 py-0.5 text-xs font-semibold text-brand-ink/70">
                      {testTypeShort(test.testType)}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        test.published
                          ? "bg-green-100 text-green-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {test.published ? "Published" : "Draft"}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-brand-ink/60">
                  {test.questionCount} questions ({test.sectionCount} sections)
                  {" · "}
                  {test.durationMinutes} min
                  {" · "}
                  <Link
                    href={`/admin/tests/${test.id}/results`}
                    className="font-medium text-brand-navy"
                  >
                    {test.attemptCount} attempt{test.attemptCount === 1 ? "" : "s"}
                  </Link>
                </p>
                <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm [&_a]:inline-flex [&_a]:min-h-9 [&_a]:items-center [&_button]:min-h-9">
                  <Link
                    href={`/admin/tests/${test.id}/preview`}
                    className="font-medium text-brand-navy"
                  >
                    Preview
                  </Link>
                  <Link
                    href={`/admin/tests/${test.id}/edit`}
                    className="font-medium text-brand-navy"
                  >
                    Edit
                  </Link>
                  <PublishToggle testId={test.id} published={test.published} />
                  <DeleteTestButton testId={test.id} />
                </div>
              </li>
            ))}
          </ul>

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[56rem] text-left text-sm">
              <thead className="border-b border-black/5 bg-brand-cream/60 text-xs uppercase tracking-wide text-brand-ink/60">
                <tr>
                  <th className="px-4 py-3 font-semibold">Title</th>
                  <th className="px-4 py-3 font-semibold">Exam</th>
                  <th className="px-4 py-3 font-semibold">Type</th>
                  <th className="px-4 py-3 font-semibold">Questions</th>
                  <th className="px-4 py-3 font-semibold">Duration</th>
                  <th className="px-4 py-3 font-semibold">Attempts</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {visibleTests.map((test) => (
                  <tr key={test.id} className="align-top">
                    <td className="px-4 py-3 font-medium text-brand-navy">
                      {test.title}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-brand-ink/70">
                      {test.targetExam}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-brand-ink/70">
                      {testTypeShort(test.testType)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-brand-ink/70">
                      {test.questionCount} ({test.sectionCount} sections)
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-brand-ink/70">
                      {test.durationMinutes} min
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <Link
                        href={`/admin/tests/${test.id}/results`}
                        className="text-brand-navy hover:text-brand-gold hover:underline"
                      >
                        {test.attemptCount}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          test.published
                            ? "bg-green-100 text-green-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {test.published ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                        <Link
                          href={`/admin/tests/${test.id}/preview`}
                          className="text-brand-navy hover:text-brand-gold hover:underline"
                        >
                          Preview
                        </Link>
                        <Link
                          href={`/admin/tests/${test.id}/edit`}
                          className="text-brand-navy hover:text-brand-gold hover:underline"
                        >
                          Edit
                        </Link>
                        <PublishToggle
                          testId={test.id}
                          published={test.published}
                        />
                        <DeleteTestButton testId={test.id} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
