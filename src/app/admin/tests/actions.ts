"use server";

import { randomUUID } from "node:crypto";

import { Prisma } from "@prisma/client";
import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";

import { getAdminSession } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { testSchema, type QuestionInput, type TestInput } from "@/lib/validation";

export type SaveTestState = { error?: string } | undefined;

async function requireAdminUser() {
  const session = await getAdminSession();
  if (!session) redirect("/login");
  return session.user;
}

type Row = Record<string, string | number | boolean | null>;

// Bulk INSERT ... ON CONFLICT (id) DO UPDATE for one table, in chunks. Rows
// that already exist are updated in place (so students' saved answers, which
// point at question/option ids, survive an edit) and new rows are inserted.
// Columns in `keepOnUpdate` are only written on insert (e.g. question topics
// that this editor does not manage).
async function upsertRows(
  tx: Prisma.TransactionClient,
  table: string,
  columns: string[],
  rows: Row[],
  keepOnUpdate: string[] = []
) {
  if (rows.length === 0) return;
  const ident = (c: string) => Prisma.raw(`"${c}"`);
  const updates = columns
    .filter((c) => c !== "id" && !keepOnUpdate.includes(c))
    .map((c) => Prisma.sql`${ident(c)} = EXCLUDED.${ident(c)}`);

  for (let i = 0; i < rows.length; i += 400) {
    const chunk = rows.slice(i, i + 400);
    const values = chunk.map(
      (row) => Prisma.sql`(${Prisma.join(columns.map((c) => row[c]))})`
    );
    await tx.$executeRaw`INSERT INTO ${ident(table)} (${Prisma.join(
      columns.map(ident)
    )}) VALUES ${Prisma.join(values)} ON CONFLICT ("id") DO UPDATE SET ${Prisma.join(
      updates
    )}`;
  }
}

async function persistTest(
  input: TestInput,
  published: boolean,
  createdById: string,
  testId?: string
): Promise<string> {
  // Ids that already belong to THIS test may be reused; anything else the
  // browser sent is replaced with a fresh id, so a request can never touch
  // another test's rows.
  const known = {
    sections: new Set<string>(),
    passages: new Set<string>(),
    questions: new Set<string>(),
    options: new Set<string>(),
  };
  if (testId) {
    const existing = await prisma.test.findUnique({
      where: { id: testId },
      select: {
        sections: {
          select: {
            id: true,
            passages: { select: { id: true } },
            questions: {
              select: { id: true, options: { select: { id: true } } },
            },
          },
        },
      },
    });
    if (!existing) throw new Error("Test not found");
    for (const s of existing.sections) {
      known.sections.add(s.id);
      s.passages.forEach((p) => known.passages.add(p.id));
      for (const q of s.questions) {
        known.questions.add(q.id);
        q.options.forEach((o) => known.options.add(o.id));
      }
    }
  }

  const used = new Set<string>();
  const pick = (id: string | undefined, set: Set<string>) => {
    if (id && set.has(id) && !used.has(id)) {
      used.add(id);
      return id;
    }
    const fresh = randomUUID();
    used.add(fresh);
    return fresh;
  };

  const sections: Row[] = [];
  const passages: Row[] = [];
  const questions: Row[] = [];
  const options: Row[] = [];

  const addQuestion = (
    q: QuestionInput,
    sectionId: string,
    passageId: string | null,
    order: number
  ) => {
    const questionId = pick(q.id, known.questions);
    questions.push({
      id: questionId,
      sectionId,
      passageId,
      order,
      text: q.text,
      imageUrl: q.imageUrl || null,
      explanation: q.explanation || null,
      marks: q.marks,
    });
    q.options.forEach((option, optionIndex) => {
      options.push({
        id: pick(option.id, known.options),
        questionId,
        text: option.text,
        imageUrl: option.imageUrl || null,
        isCorrect: option.isCorrect,
        order: optionIndex,
      });
    });
  };

  input.sections.forEach((section, sectionIndex) => {
    const sectionId = pick(section.id, known.sections);
    sections.push({ id: sectionId, name: section.name, order: sectionIndex });

    let order = 0;
    for (const block of section.blocks) {
      if (block.kind === "question") {
        addQuestion(block.question, sectionId, null, order);
        order += 1;
      } else {
        const passageId = pick(block.passage.id, known.passages);
        passages.push({
          id: passageId,
          sectionId,
          title: block.passage.passageTitle || null,
          text: block.passage.passageText,
        });
        for (const question of block.passage.questions) {
          addQuestion(question, sectionId, passageId, order);
          order += 1;
        }
      }
    }
  });

  return prisma.$transaction(
    async (tx) => {
      let id = testId;
      if (id) {
        await tx.test.update({
          where: { id },
          data: {
            title: input.title,
            description: input.description || null,
            targetExam: input.targetExam,
            durationMinutes: input.durationMinutes,
            published,
          },
        });
      } else {
        const created = await tx.test.create({
          data: {
            title: input.title,
            description: input.description || null,
            targetExam: input.targetExam,
            durationMinutes: input.durationMinutes,
            published,
            isFreePreview: true,
            createdById,
          },
        });
        id = created.id;
      }
      const owner = id;

      await upsertRows(
        tx,
        "Section",
        ["id", "testId", "name", "order"],
        sections.map((s) => ({ ...s, testId: owner }))
      );
      await upsertRows(tx, "Passage", ["id", "sectionId", "title", "text"], passages);
      await upsertRows(
        tx,
        "Question",
        ["id", "sectionId", "passageId", "order", "text", "imageUrl", "explanation", "marks"],
        questions
      );
      await upsertRows(
        tx,
        "Option",
        ["id", "questionId", "text", "imageUrl", "isCorrect", "order"],
        options
      );

      // Remove whatever the admin deleted in the editor. Children first so
      // foreign keys are satisfied; a removed question takes its answers with
      // it, a removed option just clears that selection.
      const keep = (rows: Row[]) => rows.map((r) => r.id as string);
      await tx.option.deleteMany({
        where: { question: { section: { testId: owner } }, id: { notIn: keep(options) } },
      });
      await tx.question.deleteMany({
        where: { section: { testId: owner }, id: { notIn: keep(questions) } },
      });
      await tx.passage.deleteMany({
        where: { section: { testId: owner }, id: { notIn: keep(passages) } },
      });
      await tx.section.deleteMany({
        where: { testId: owner, id: { notIn: keep(sections) } },
      });

      return owner;
    },
    { timeout: 60_000, maxWait: 10_000 }
  );
}

export async function createTest(
  input: TestInput,
  published: boolean
): Promise<SaveTestState> {
  const admin = await requireAdminUser();

  const parsed = testSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid test data" };
  }

  try {
    await persistTest(parsed.data, published, admin.id);
  } catch (error) {
    console.error("Failed to create test:", error);
    return { error: "Could not save this test. Please try again." };
  }
  revalidateTag("tests");
  redirect("/admin/tests");
}

export async function updateTest(
  testId: string,
  input: TestInput,
  published: boolean
): Promise<SaveTestState> {
  const admin = await requireAdminUser();

  const parsed = testSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid test data" };
  }

  try {
    await persistTest(parsed.data, published, admin.id, testId);
  } catch (error) {
    console.error("Failed to update test:", error);
    return { error: "Could not update this test." };
  }
  revalidateTag("tests");
  redirect("/admin/tests");
}

export async function setTestPublished(testId: string, published: boolean) {
  await requireAdminUser();

  const test = await prisma.test.findUnique({ where: { id: testId } });
  if (!test) throw new Error("Test not found");

  await prisma.test.update({ where: { id: testId }, data: { published } });
  revalidateTag("tests");
}

export async function deleteTest(testId: string) {
  await requireAdminUser();

  const test = await prisma.test.findUnique({ where: { id: testId } });
  if (!test) throw new Error("Test not found");

  await prisma.test.delete({ where: { id: testId } });
  revalidateTag("tests");
}
