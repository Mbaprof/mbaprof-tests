import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";

import { TestBuilder, type InitialTestData } from "../../test-builder";

export const metadata: Metadata = { title: "Edit test | MBAProf Tests" };

export default async function EditTestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const test = await prisma.test.findUnique({
    where: { id },
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
  });

  if (!test) {
    notFound();
  }

  const initialData: InitialTestData = {
    title: test.title,
    description: test.description ?? "",
    targetExam: test.targetExam,
    testType: test.testType,
    durationMinutes: test.durationMinutes,
    sections: test.sections.map((section) => {
      const blocks: InitialTestData["sections"][number]["blocks"] = [];
      let openPassageId: string | null = null;

      for (const question of section.questions) {
        const questionState = {
          id: question.id,
          text: question.text,
          imageUrl: question.imageUrl ?? "",
          explanation: question.explanation ?? "",
          marks: question.marks,
          options: question.options.map((option) => ({
            id: option.id,
            text: option.text,
            imageUrl: option.imageUrl ?? "",
            isCorrect: option.isCorrect,
          })),
        };

        const last = blocks[blocks.length - 1];
        if (question.passage && question.passage.id === openPassageId && last?.passage) {
          last.questions.push(questionState);
          continue;
        }

        if (question.passage) {
          blocks.push({
            id: question.passage.id,
            passage: {
              title: question.passage.title ?? "",
              text: question.passage.text,
            },
            questions: [questionState],
          });
          openPassageId = question.passage.id;
        } else {
          blocks.push({ id: question.id, passage: null, questions: [questionState] });
          openPassageId = null;
        }
      }

      return { id: section.id, name: section.name, blocks };
    }),
  };

  return (
    <div>
      <Link href="/admin/tests" className="text-sm text-brand-navy hover:underline">
        ← Back to tests
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-brand-navy">Edit test</h1>
      <p className="mt-1 text-sm text-brand-ink/60">
        Changes apply to students as soon as you save. Students&apos; existing
        answers to questions you keep are preserved.
      </p>
      <div className="mt-8">
        <TestBuilder testId={test.id} initialData={initialData} />
      </div>
    </div>
  );
}
