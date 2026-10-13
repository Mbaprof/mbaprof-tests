import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { MathText } from "@/components/math-text";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Preview test | MBAProf Tests" };

export default async function PreviewTestPage({
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

  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/admin/tests" className="text-sm text-brand-navy hover:underline">
        ← Back to all tests
      </Link>

      <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">{test.title}</h1>
          {test.description && (
            <p className="mt-1 text-sm text-brand-ink/70">{test.description}</p>
          )}
          <p className="mt-2 text-sm text-brand-ink/60">
            {test.targetExam} · {test.durationMinutes} min ·{" "}
            {test.sections.reduce((sum, s) => sum + s.questions.length, 0)} questions ·{" "}
            {test.published ? "Published" : "Draft"}
          </p>
        </div>
        <Link
          href={`/admin/tests/${test.id}/edit`}
          className="rounded-md border border-brand-navy/20 px-4 py-2 text-sm font-semibold text-brand-navy transition-colors hover:bg-brand-navy/5"
        >
          Edit test
        </Link>
      </div>

      <div className="mt-8 space-y-10">
        {test.sections.map((section) => {
          let lastPassageId: string | null = null;
          return (
            <section key={section.id}>
              <h2 className="text-lg font-semibold text-brand-navy">
                {section.name}
              </h2>
              <div className="mt-4 space-y-4">
                {section.questions.map((question, index) => {
                  const showPassage =
                    question.passage && question.passage.id !== lastPassageId;
                  lastPassageId = question.passage?.id ?? null;

                  return (
                    <div key={question.id}>
                      {showPassage && question.passage && (
                        <div className="mb-3 rounded-xl border border-brand-gold/30 bg-brand-cream/40 p-4">
                          {question.passage.title && (
                            <p className="mb-1 font-semibold text-brand-navy">
                              {question.passage.title}
                            </p>
                          )}
                          <MathText
                            text={question.passage.text}
                            className="text-sm text-brand-ink/80"
                          />
                        </div>
                      )}
                      <div className="rounded-xl border border-black/5 bg-white p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="text-sm font-medium text-brand-ink">
                            <span>Q{index + 1}. </span>
                            <MathText text={question.text} />
                            {question.imageUrl && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={question.imageUrl}
                                alt="Question illustration"
                                className="mt-2 max-h-72 rounded-md border border-black/10 object-contain"
                              />
                            )}
                          </div>
                          <span className="shrink-0 rounded-full bg-brand-cream px-2.5 py-1 text-xs font-semibold text-brand-ink/60">
                            {question.marks} mark{question.marks === 1 ? "" : "s"}
                          </span>
                        </div>

                        <div className="mt-3 space-y-2">
                          {question.options.map((option, oIndex) => (
                            <div
                              key={option.id}
                              className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm ${
                                option.isCorrect
                                  ? "border-green-300 bg-green-50"
                                  : "border-black/10"
                              }`}
                            >
                              <span className="text-brand-ink/50">
                                {String.fromCharCode(65 + oIndex)}.
                              </span>
                              <span className="flex-1">
                                <MathText text={option.text} />
                                {option.imageUrl && (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={option.imageUrl}
                                    alt="Option illustration"
                                    className="mt-2 max-h-40 rounded-md border border-black/10 object-contain"
                                  />
                                )}
                              </span>
                              {option.isCorrect && (
                                <span className="ml-auto text-xs font-semibold text-green-700">
                                  Correct answer
                                </span>
                              )}
                            </div>
                          ))}
                        </div>

                        {question.explanation && (
                          <p className="mt-3 rounded-md bg-brand-cream p-3 text-sm text-brand-ink/80">
                            <span className="font-semibold text-brand-navy">
                              Explanation:{" "}
                            </span>
                            <MathText text={question.explanation} />
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
