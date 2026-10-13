import type { Metadata } from "next";

import { prisma } from "@/lib/prisma";

import { TestList, type TestRow } from "./test-list";

export const metadata: Metadata = { title: "Tests | MBAProf Tests" };

export default async function AdminTestsPage() {
  const tests = await prisma.test.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      targetExam: true,
      durationMinutes: true,
      published: true,
      sections: { select: { _count: { select: { questions: true } } } },
      _count: { select: { attempts: true } },
    },
  });

  const rows: TestRow[] = tests.map((t) => ({
    id: t.id,
    title: t.title,
    targetExam: t.targetExam,
    durationMinutes: t.durationMinutes,
    published: t.published,
    questionCount: t.sections.reduce((sum, s) => sum + s._count.questions, 0),
    sectionCount: t.sections.length,
    attemptCount: t._count.attempts,
  }));

  return <TestList tests={rows} />;
}
