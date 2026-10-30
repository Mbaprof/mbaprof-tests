import type { Metadata } from "next";
import Link from "next/link";

import {
  addDays,
  daysSummary,
  formatClock,
  istInstant,
  relativeDay,
  sessionsBetween,
  todayIst,
  joinState,
} from "@/lib/lectures";
import { ENROLL_BATCH_SETTING, ENROLL_CODE } from "@/lib/enroll";
import { prisma } from "@/lib/prisma";

import { EnrollBatchSelect } from "./enroll-batch-select";

export const metadata: Metadata = { title: "Batches | MBAProf Tests" };

export default async function AdminBatchesPage() {
  const today = todayIst();
  const [batches, overrides, enrollSetting, enrolledBasic, plusWithCode] = await Promise.all([
    prisma.batch.findMany({
      orderBy: [{ active: "desc" }, { createdAt: "asc" }],
      include: { _count: { select: { students: true, lectures: true } } },
    }),
    prisma.classOverride.findMany({
      where: { classDate: { gte: new Date(`${today}T00:00:00Z`) } },
    }),
    prisma.setting.findUnique({ where: { key: ENROLL_BATCH_SETTING } }),
    prisma.lead.count({ where: { code: ENROLL_CODE, plan: "BASIC", stage: "ENROLLED" } }),
    prisma.lead.count({ where: { code: ENROLL_CODE, plan: "PLUS" } }),
  ]);
  const activeBatches = batches.filter((b) => b.active).map((b) => ({ id: b.id, name: b.name }));
  const enrollBatchId = activeBatches.some((b) => b.id === enrollSetting?.value) ? enrollSetting!.value : "";

  const rows = batches.map((batch) => {
    const mine = overrides.filter((o) => o.batchId === batch.id);
    const next = sessionsBetween(batch, mine, today, addDays(today, 21)).find(
      (s) => joinState(s) !== "ended" && joinState(s) !== "cancelled"
    );
    return { batch, next };
  });

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">Batches</h1>
          <p className="mt-1 text-sm text-brand-ink/60">
            Each batch has its own class schedule, Zoom link and recordings.
            Students only see their own batch.
          </p>
        </div>
        <Link
          href="/admin/batches/new"
          className="whitespace-nowrap rounded-md bg-brand-navy px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-navy-light"
        >
          + New batch
        </Link>
      </div>

      <div className="mt-6 rounded-2xl border border-black/5 bg-white shadow-[0_2px_10px_rgba(11,29,46,0.05)] p-5">
        <label htmlFor="enroll-batch" className="font-semibold text-brand-navy">
          CET Basic enrollments join
        </label>
        <p className="mb-3 mt-1 text-sm text-brand-ink/60">
          Students who enroll in CET Basic with code {ENROLL_CODE} on the enroll page get their login at
          once and are placed in this batch.
        </p>
        <EnrollBatchSelect batches={activeBatches} current={enrollBatchId} />
        <p className="mt-3 text-xs text-brand-ink/60">
          So far: {enrolledBasic} CET Basic enrolled · {plusWithCode} CET Plus lead{plusWithCode === 1 ? "" : "s"} with
          the code (see Leads)
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-brand-navy/20 bg-white p-10 text-center">
          <p className="text-brand-ink/70">No batches yet.</p>
          <Link
            href="/admin/batches/new"
            className="mt-4 inline-block rounded-md bg-brand-navy px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-navy-light"
          >
            Create your first batch
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {rows.map(({ batch, next }) => (
            <Link
              key={batch.id}
              href={`/admin/batches/${batch.id}`}
              className="block rounded-2xl border border-black/5 bg-white shadow-[0_2px_10px_rgba(11,29,46,0.05)] p-5 transition-all hover:-translate-y-0.5 hover:border-brand-navy/15 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-brand-navy">{batch.name}</p>
                  <p className="mt-1 text-xs text-brand-ink/60">{batch.targetExam}</p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    batch.active
                      ? "bg-green-100 text-green-700"
                      : "bg-black/5 text-brand-ink/60"
                  }`}
                >
                  {batch.active ? "Active" : "Inactive"}
                </span>
              </div>
              <p className="mt-3 text-sm text-brand-ink/80">
                {daysSummary(batch.days)} · {formatClock(istInstant(today, batch.startTime))} ·{" "}
                {batch.durationMinutes} min
              </p>
              <p className="mt-1 text-xs text-brand-ink/60">
                {next
                  ? `Next class: ${relativeDay(next.date, today)} ${formatClock(next.start)}`
                  : "No upcoming class in the next 3 weeks"}
              </p>
              <p className="mt-3 text-xs text-brand-ink/60">
                {batch._count.students} student{batch._count.students === 1 ? "" : "s"} ·{" "}
                {batch._count.lectures} recording{batch._count.lectures === 1 ? "" : "s"}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
