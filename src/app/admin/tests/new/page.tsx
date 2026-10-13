import type { Metadata } from "next";
import Link from "next/link";

import { MBA_ENTRANCE_EXAMS } from "@/lib/validation";

import { TestBuilder } from "../test-builder";

export const metadata: Metadata = { title: "New test | MBAProf Tests" };

export default async function NewTestPage({
  searchParams,
}: {
  searchParams: Promise<{ exam?: string }>;
}) {
  const { exam } = await searchParams;
  const initialExam = MBA_ENTRANCE_EXAMS.includes(
    exam as (typeof MBA_ENTRANCE_EXAMS)[number]
  )
    ? exam
    : undefined;

  return (
    <div>
      <Link href="/admin/tests" className="text-sm text-brand-navy hover:underline">
        ← Back to tests
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-brand-navy">Create a new test</h1>
      <p className="mt-1 text-sm text-brand-ink/60">
        Add sections and questions below, then save as a draft or publish it
        for students right away.
      </p>
      <div className="mt-8">
        <TestBuilder initialExam={initialExam} />
      </div>
    </div>
  );
}
