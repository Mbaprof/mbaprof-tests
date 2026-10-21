import type { Prisma, PrismaClient } from "@prisma/client";

import { MBA_ENTRANCE_EXAMS } from "@/lib/validation";

export const NOT_SET = "Not set";
export const PAGE_SIZE = 25;

export type StudentFilters = {
  q: string;
  batch: string; // "" = all, "none" = students without a batch, else a batch id
  exam: string; // "" = all, NOT_SET = students without an exam, else an exam name
  page: number;
};

type Params = Record<string, string | string[] | undefined>;

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

// Reads and sanitises the list's query-string filters. Unknown exam names are
// ignored rather than trusted.
export function parseStudentFilters(params: Params): StudentFilters {
  const q = first(params.q).trim().slice(0, 100);
  const examRaw = first(params.exam);
  const exam =
    examRaw === NOT_SET || (MBA_ENTRANCE_EXAMS as readonly string[]).includes(examRaw)
      ? examRaw
      : "";
  const batchRaw = first(params.batch);
  const batch = batchRaw === "none" || /^[a-z0-9]{10,40}$/i.test(batchRaw) ? batchRaw : "";
  const page = Math.max(1, Math.floor(Number(first(params.page))) || 1);
  return { q, exam, batch, page };
}

export function studentWhere({ q, exam, batch }: StudentFilters): Prisma.UserWhereInput {
  const where: Prisma.UserWhereInput = { role: "STUDENT" };
  if (batch === "none") where.batchId = null;
  else if (batch) where.batchId = batch;
  if (exam === NOT_SET) where.targetExam = null;
  else if (exam) where.targetExam = exam;
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { phone: { contains: q } },
      { college: { contains: q, mode: "insensitive" } },
      { course: { contains: q, mode: "insensitive" } },
    ];
  }
  return where;
}

export const studentSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  college: true,
  course: true,
  targetExam: true,
  createdAt: true,
  batch: { select: { id: true, name: true } },
  _count: { select: { attempts: true } },
  attempts: {
    orderBy: { startedAt: "desc" },
    take: 1,
    select: { startedAt: true },
  },
} satisfies Prisma.UserSelect;

// Submitted-attempt counts for a set of students, in one query.
export async function submittedCounts(
  db: Pick<PrismaClient, "testAttempt">,
  studentIds: string[]
) {
  if (studentIds.length === 0) return new Map<string, number>();
  const rows = await db.testAttempt.groupBy({
    by: ["studentId"],
    where: { studentId: { in: studentIds }, submittedAt: { not: null } },
    _count: { _all: true },
  });
  return new Map(rows.map((r) => [r.studentId, r._count._all]));
}

// Digits-only international number for a wa.me link. Students type Indian
// mobile numbers as 10 digits (sometimes with +91, 91 or a leading 0);
// anything that does not look like a phone number returns null.
export function whatsappNumber(phone: string | null | undefined) {
  if (!phone) return null;
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
  if (digits.length === 10) digits = "91" + digits;
  return digits.length >= 11 && digits.length <= 15 ? digits : null;
}
