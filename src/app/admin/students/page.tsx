import type { Metadata } from "next";
import Link from "next/link";

import { istDate, istDateTime } from "@/lib/admin";
import {
  NOT_SET,
  PAGE_SIZE,
  parseStudentFilters,
  studentSelect,
  studentWhere,
  submittedCounts,
} from "@/lib/admin-students";
import { assignStudentsToBatch } from "@/app/admin/batches/actions";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { prisma } from "@/lib/prisma";
import { MBA_ENTRANCE_EXAMS } from "@/lib/validation";

import { BulkAssignBar } from "./bulk-assign-bar";

export const metadata: Metadata = { title: "Students | MBAProf Tests" };

export default async function AdminStudentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filters = parseStudentFilters(await searchParams);
  const where = studentWhere(filters);

  const [total, batches] = await Promise.all([
    prisma.user.count({ where }),
    prisma.batch.findMany({
      orderBy: { createdAt: "asc" },
      select: { id: true, name: true },
    }),
  ]);
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(filters.page, pageCount);

  const students = await prisma.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    select: studentSelect,
  });
  const submitted = await submittedCounts(
    prisma,
    students.map((s) => s.id)
  );

  const qs = (overrides: Record<string, string | number | undefined>) => {
    const p = new URLSearchParams();
    const merged = {
      q: filters.q,
      exam: filters.exam,
      batch: filters.batch,
      page: undefined,
      ...overrides,
    };
    for (const [k, v] of Object.entries(merged)) {
      const text = v === undefined ? "" : String(v);
      if (text !== "" && text !== "1") p.set(k, text);
    }
    const s = p.toString();
    return s ? `?${s}` : "";
  };

  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);
  const filtered = Boolean(filters.q || filters.exam || filters.batch);

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">Students</h1>
          <p className="mt-1 text-sm text-brand-ink/60">
            {total.toLocaleString("en-IN")} {filtered ? "matching" : "registered"}{" "}
            {total === 1 ? "student" : "students"}, newest first.
          </p>
        </div>
        <a
          href={`/admin/students/export${qs({ page: undefined })}`}
          className="whitespace-nowrap rounded-md bg-brand-navy px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-navy-light"
        >
          Download CSV
        </a>
      </div>

      <form
        method="get"
        className="mt-6 flex flex-wrap items-end gap-3 rounded-xl border border-black/5 bg-white p-4"
      >
        <div className="w-full flex-1 sm:min-w-[14rem]">
          <label htmlFor="q" className="block text-xs font-medium text-brand-ink/70">
            Search
          </label>
          <input
            id="q"
            name="q"
            defaultValue={filters.q}
            placeholder="Name, email, phone, college or course"
            className="mt-1 w-full rounded-md border border-black/10 bg-white px-3 py-2 text-sm focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy"
          />
        </div>
        <div className="w-full sm:w-auto">
          <label htmlFor="exam" className="block text-xs font-medium text-brand-ink/70">
            Target exam
          </label>
          <select
            id="exam"
            name="exam"
            defaultValue={filters.exam}
            className="mt-1 w-full rounded-md sm:w-48 border border-black/10 bg-white px-3 py-2 text-sm focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy"
          >
            <option value="">All exams</option>
            {MBA_ENTRANCE_EXAMS.map((exam) => (
              <option key={exam} value={exam}>
                {exam}
              </option>
            ))}
            <option value={NOT_SET}>{NOT_SET}</option>
          </select>
        </div>
        <div className="w-full sm:w-auto">
          <label htmlFor="batch" className="block text-xs font-medium text-brand-ink/70">
            Batch
          </label>
          <select
            id="batch"
            name="batch"
            defaultValue={filters.batch}
            className="mt-1 w-full rounded-md border border-black/10 bg-white px-3 py-2 text-sm focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy sm:w-48"
          >
            <option value="">All batches</option>
            {batches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
            <option value="none">No batch yet</option>
          </select>
        </div>
        <button
          type="submit"
          className="cursor-pointer rounded-md border border-brand-navy/20 px-4 py-2 text-sm font-semibold text-brand-navy transition-colors hover:bg-brand-navy hover:text-white"
        >
          Apply
        </button>
        {filtered && (
          <Link
            href="/admin/students"
            className="py-2 text-sm font-medium text-brand-ink/60 hover:text-brand-navy hover:underline"
          >
            Clear
          </Link>
        )}
      </form>

      {students.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-brand-navy/20 bg-white p-10 text-center text-brand-ink/60">
          {filtered
            ? "No students match these filters."
            : "No students have registered yet."}
        </div>
      ) : (
        <form
          action={assignStudentsToBatch}
          className="mt-6 overflow-hidden rounded-xl border border-black/5 bg-white"
        >
          <input type="hidden" name="returnTo" value={`/admin/students${qs({ page })}`} />
          <BulkAssignBar batches={batches} />
          <ul className="divide-y divide-black/5 md:hidden">
            {students.map((s) => {
              const last = s.attempts[0]?.startedAt;
              return (
                <li key={s.id} className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <input
                      type="checkbox"
                      name="ids"
                      value={s.id}
                      aria-label={`Select ${s.name}`}
                      className="mt-1 h-5 w-5 shrink-0 accent-brand-navy"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-brand-ink">{s.name}</p>
                      <a
                        href={`mailto:${s.email}`}
                        className="block break-all text-xs text-brand-ink/60"
                      >
                        {s.email}
                      </a>
                    </div>
                    {s.targetExam && (
                      <span className="shrink-0 rounded-full bg-brand-gold/15 px-2.5 py-0.5 text-xs font-semibold text-brand-gold">
                        {s.targetExam}
                      </span>
                    )}
                  </div>

                  {s.phone && (
                    <div className="flex flex-wrap items-center gap-3">
                      <a
                        href={`tel:${s.phone}`}
                        className="inline-flex min-h-9 items-center text-sm font-medium text-brand-navy"
                      >
                        {s.phone}
                      </a>
                      <WhatsAppButton phone={s.phone} name={s.name} large />
                    </div>
                  )}

                  {(s.college || s.course) && (
                    <p className="text-sm text-brand-ink/80">
                      {[s.college, s.course].filter(Boolean).join(" · ")}
                    </p>
                  )}

                  <p className="text-xs text-brand-ink/60">
                    Batch: <span className="font-medium text-brand-ink">{s.batch?.name ?? "Not assigned"}</span>
                  </p>

                  <dl className="grid grid-cols-3 gap-2 rounded-lg bg-brand-cream/60 px-3 py-2 text-xs">
                    <div>
                      <dt className="text-brand-ink/50">Joined</dt>
                      <dd className="font-medium text-brand-ink">
                        {istDate.format(s.createdAt)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-brand-ink/50">Tests</dt>
                      <dd className="font-medium text-brand-ink">
                        {submitted.get(s.id) ?? 0} / {s._count.attempts}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-brand-ink/50">Last active</dt>
                      <dd className="font-medium text-brand-ink">
                        {last ? istDate.format(last) : "Never"}
                      </dd>
                    </div>
                  </dl>
                </li>
              );
            })}
          </ul>

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[64rem] text-left text-sm">
              <thead className="border-b border-black/5 bg-brand-cream/60 text-xs uppercase tracking-wide text-brand-ink/60">
                <tr>
                  <th className="w-10 px-4 py-3 font-semibold">
                    <span className="sr-only">Select</span>
                  </th>
                  <th className="px-4 py-3 font-semibold">Student</th>
                  <th className="px-4 py-3 font-semibold">Phone</th>
                  <th className="px-4 py-3 font-semibold">College / course</th>
                  <th className="px-4 py-3 font-semibold">Exam</th>
                  <th className="px-4 py-3 font-semibold">Batch</th>
                  <th className="px-4 py-3 font-semibold">Joined</th>
                  <th className="px-4 py-3 text-right font-semibold">Tests</th>
                  <th className="px-4 py-3 font-semibold">Last active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {students.map((s) => {
                  const last = s.attempts[0]?.startedAt;
                  return (
                    <tr key={s.id} className="align-top">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          name="ids"
                          value={s.id}
                          aria-label={`Select ${s.name}`}
                          className="h-4 w-4 accent-brand-navy"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-brand-ink">{s.name}</p>
                        <a
                          href={`mailto:${s.email}`}
                          className="text-xs text-brand-ink/60 hover:text-brand-navy hover:underline"
                        >
                          {s.email}
                        </a>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        {s.phone ? (
                          <div className="flex items-center gap-2">
                            <a
                              href={`tel:${s.phone}`}
                              className="text-brand-ink hover:text-brand-navy hover:underline"
                            >
                              {s.phone}
                            </a>
                            <WhatsAppButton phone={s.phone} name={s.name} />
                          </div>
                        ) : (
                          <span className="text-brand-ink/40">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-brand-ink">{s.college ?? "-"}</p>
                        <p className="text-xs text-brand-ink/60">{s.course ?? "-"}</p>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        {s.targetExam ? (
                          <span className="rounded-full bg-brand-gold/15 px-2.5 py-0.5 text-xs font-semibold text-brand-gold">
                            {s.targetExam}
                          </span>
                        ) : (
                          <span className="text-brand-ink/40">-</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-brand-ink/80">
                        {s.batch?.name ?? <span className="text-brand-ink/40">-</span>}
                      </td>
                      <td
                        className="whitespace-nowrap px-4 py-3 text-brand-ink/80"
                        title={istDateTime.format(s.createdAt)}
                      >
                        {istDate.format(s.createdAt)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right">
                        <span className="font-semibold text-brand-navy">
                          {submitted.get(s.id) ?? 0}
                        </span>
                        <span className="text-brand-ink/50">
                          {" "}
                          / {s._count.attempts}
                        </span>
                      </td>
                      <td
                        className="whitespace-nowrap px-4 py-3 text-brand-ink/80"
                        title={last ? istDateTime.format(last) : undefined}
                      >
                        {last ? istDate.format(last) : <span className="text-brand-ink/40">Never</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-black/5 px-4 py-3 text-sm">
            <p className="text-brand-ink/60">
              Showing {from}-{to} of {total.toLocaleString("en-IN")}
            </p>
            <div className="flex items-center gap-2">
              {page > 1 ? (
                <Link
                  href={`/admin/students${qs({ page: page - 1 })}`}
                  className="rounded-md border border-black/10 px-3 py-1.5 font-medium text-brand-navy hover:bg-brand-cream"
                >
                  Previous
                </Link>
              ) : (
                <span className="rounded-md border border-black/5 px-3 py-1.5 text-brand-ink/30">
                  Previous
                </span>
              )}
              <span className="text-brand-ink/60">
                Page {page} of {pageCount}
              </span>
              {page < pageCount ? (
                <Link
                  href={`/admin/students${qs({ page: page + 1 })}`}
                  className="rounded-md border border-black/10 px-3 py-1.5 font-medium text-brand-navy hover:bg-brand-cream"
                >
                  Next
                </Link>
              ) : (
                <span className="rounded-md border border-black/5 px-3 py-1.5 text-brand-ink/30">
                  Next
                </span>
              )}
            </div>
          </div>
        </form>
      )}

      <p className="mt-4 text-xs text-brand-ink/50">
        &quot;Tests&quot; shows submitted / started. Times are shown in IST.
      </p>
    </div>
  );
}
