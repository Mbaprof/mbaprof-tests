import { getAdminSession } from "@/lib/admin";
import {
  parseStudentFilters,
  studentSelect,
  studentWhere,
  submittedCounts,
} from "@/lib/admin-students";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const MAX_ROWS = 20000;

// Spreadsheet apps run cells that start with = + - @ as formulas, so a
// malicious sign-up name could execute in an admin's Excel. Prefix those with
// a quote, then apply normal CSV quoting.
function cell(value: string | number | null | undefined) {
  let s = value === null || value === undefined ? "" : String(value);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

const ymd = (d: Date) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(d);

export async function GET(request: Request) {
  const admin = await getAdminSession();
  if (!admin) return new Response("Forbidden", { status: 403 });

  const url = new URL(request.url);
  const filters = parseStudentFilters(Object.fromEntries(url.searchParams));

  const students = await prisma.user.findMany({
    where: studentWhere(filters),
    orderBy: { createdAt: "desc" },
    take: MAX_ROWS,
    select: studentSelect,
  });
  const submitted = await submittedCounts(
    prisma,
    students.map((s) => s.id)
  );

  const header = [
    "Name",
    "Email",
    "Phone",
    "College",
    "Course",
    "Target exam",
    "Joined (IST date)",
    "Tests started",
    "Tests submitted",
    "Last active (IST date)",
  ];
  const lines = [header.map(cell).join(",")];
  for (const s of students) {
    const last = s.attempts[0]?.startedAt;
    lines.push(
      [
        s.name,
        s.email,
        s.phone,
        s.college,
        s.course,
        s.targetExam,
        ymd(s.createdAt),
        s._count.attempts,
        submitted.get(s.id) ?? 0,
        last ? ymd(last) : "",
      ]
        .map(cell)
        .join(",")
    );
  }

  // BOM so Excel opens the file as UTF-8.
  const body = "﻿" + lines.join("\r\n") + "\r\n";
  return new Response(body, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="mbaprof-students-${ymd(new Date())}.csv"`,
      "cache-control": "no-store",
    },
  });
}
