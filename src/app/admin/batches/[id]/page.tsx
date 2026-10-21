import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  addDays,
  dateToYmd,
  daysSummary,
  formatClock,
  formatDay,
  joinState,
  relativeDay,
  sessionsBetween,
  todayIst,
  ymdToDate,
  type BatchInput,
} from "@/lib/lectures";
import { prisma } from "@/lib/prisma";

import { BatchForm } from "../batch-form";
import {
  DeleteBatchButton,
  OverridesPanel,
  RecordingsPanel,
  TopicsPanel,
  type LectureItem,
  type OverrideItem,
  type TopicRow,
} from "../batch-panels";

export const metadata: Metadata = { title: "Batch | MBAProf Tests" };

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-8 rounded-xl border border-black/5 bg-white p-5 sm:p-6">
      <h2 className="text-base font-semibold text-brand-navy">{title}</h2>
      {hint && <p className="mt-1 text-sm text-brand-ink/60">{hint}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default async function AdminBatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const today = todayIst();
  const lookback = addDays(today, -21);

  const [batch, overrides, lectures, joins] = await Promise.all([
    prisma.batch.findUnique({
      where: { id },
      include: { _count: { select: { students: true } } },
    }),
    prisma.classOverride.findMany({
      where: { batchId: id, classDate: { gte: ymdToDate(lookback) } },
      orderBy: { classDate: "asc" },
    }),
    prisma.lecture.findMany({
      where: { batchId: id },
      orderBy: [{ classDate: "desc" }, { part: "asc" }],
      take: 60,
    }),
    prisma.lectureJoin.findMany({
      where: { batchId: id, classDate: { gte: ymdToDate(lookback) } },
      orderBy: { joinedAt: "asc" },
      select: { classDate: true, user: { select: { name: true } } },
    }),
  ]);

  if (!batch) notFound();

  const initial: BatchInput = {
    name: batch.name,
    targetExam: batch.targetExam as BatchInput["targetExam"],
    zoomJoinUrl: batch.zoomJoinUrl,
    zoomPasscode: batch.zoomPasscode ?? "",
    days: batch.days,
    startTime: batch.startTime,
    durationMinutes: batch.durationMinutes,
    active: batch.active,
  };

  const overrideItems: OverrideItem[] = overrides
    .filter((o) => dateToYmd(o.classDate) >= today)
    .map((o) => ({
      id: o.id,
      date: dateToYmd(o.classDate),
      kind: o.kind,
      startTime: o.startTime,
      durationMinutes: o.durationMinutes,
      note: o.note,
    }));

  // Planned topics for the next two weeks (a topic can exist before its recording).
  const topicByDate = new Map<string, string>();
  for (const l of lectures) {
    const d = dateToYmd(l.classDate);
    if (l.topic && !topicByDate.has(d)) topicByDate.set(d, l.topic);
  }
  const topicRows: TopicRow[] = sessionsBetween(batch, overrides, today, addDays(today, 13)).map(
    (s) => ({
      date: s.date,
      label: relativeDay(s.date, today) === formatDay(s.date)
        ? formatDay(s.date)
        : relativeDay(s.date, today) + " (" + formatDay(s.date) + ")",
      time: formatClock(s.start) + " - " + formatClock(s.end),
      cancelled: s.status === "cancelled",
      topic: topicByDate.get(s.date) ?? "",
    })
  );

  // Hide topic-only rows for days that have not happened yet from the recordings list.
  const lectureItems: LectureItem[] = lectures
    .filter((l) => l.recordingUrl || dateToYmd(l.classDate) <= today)
    .map((l) => ({
    id: l.id,
    date: dateToYmd(l.classDate),
    part: l.part,
    auto: !!l.zoomUuid,
    topic: l.topic,
    recordingUrl: l.recordingUrl,
    recordingPasscode: l.recordingPasscode,
    published: l.published,
  }));

  // Attendance for classes that have started in the last three weeks.
  const createdOn = todayIst(batch.createdAt);
  const attendanceFrom = createdOn > lookback ? createdOn : lookback;
  const pastSessions = sessionsBetween(batch, overrides, attendanceFrom, today)
    .filter((s) => s.status !== "cancelled" && joinState(s) !== "upcoming")
    .reverse()
    .slice(0, 10);
  const joinsByDate = new Map<string, string[]>();
  for (const j of joins) {
    const d = dateToYmd(j.classDate);
    joinsByDate.set(d, [...(joinsByDate.get(d) ?? []), j.user.name]);
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/admin/batches" className="text-sm text-brand-navy hover:underline">
        ← Back to batches
      </Link>
      <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">{batch.name}</h1>
          <p className="mt-1 text-sm text-brand-ink/60">
            {batch.targetExam} · {daysSummary(batch.days)} · {batch._count.students} student
            {batch._count.students === 1 ? "" : "s"}
          </p>
        </div>
        <div className="flex flex-wrap gap-3 text-sm font-medium">
          <Link
            href={`/admin/students?batch=${batch.id}`}
            className="text-brand-navy hover:underline"
          >
            View students
          </Link>
          <Link
            href={`/student/lectures?batch=${batch.id}`}
            className="text-brand-navy hover:underline"
          >
            Preview as student
          </Link>
        </div>
      </div>

      <div className="mt-6">
        <BatchForm batchId={batch.id} initial={initial} />
      </div>

      <Section
        title="Cancel or change a day"
        hint="Holiday, teacher unavailable, or an extra class. Students see the change straight away."
      >
        <OverridesPanel batchId={batch.id} overrides={overrideItems} today={today} />
      </Section>

      <Section
        title="Topics for upcoming classes"
        hint="Type what each class will cover. Students see it in their weekly schedule and on the next-class card."
      >
        <TopicsPanel batchId={batch.id} rows={topicRows} />
      </Section>

      <Section
        title="Recordings"
        hint="Recordings appear here automatically when Zoom finishes processing a class (once the Zoom connection is set up). You can also paste one by hand, add a topic, hide or delete any of them."
      >
        <RecordingsPanel batchId={batch.id} lectures={lectureItems} today={today} />
      </Section>

      <Section
        title="Attendance"
        hint="Who pressed Join in the last few classes (counted once per student per day)."
      >
        {pastSessions.length === 0 ? (
          <p className="text-sm text-brand-ink/60">No classes held yet.</p>
        ) : (
          <ul className="divide-y divide-black/5 rounded-lg border border-black/5">
            {pastSessions.map((s) => {
              const names = joinsByDate.get(s.date) ?? [];
              return (
                <li key={s.date} className="px-4 py-3 text-sm">
                  <details>
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
                      <span className="font-medium text-brand-ink">{formatDay(s.date)}</span>
                      <span className="text-brand-ink/70">
                        {names.length} of {batch._count.students} joined
                      </span>
                    </summary>
                    {names.length > 0 ? (
                      <p className="mt-2 text-xs leading-relaxed text-brand-ink/70">
                        {names.join(", ")}
                      </p>
                    ) : (
                      <p className="mt-2 text-xs text-brand-ink/50">Nobody joined.</p>
                    )}
                  </details>
                </li>
              );
            })}
          </ul>
        )}
      </Section>

      <div className="mt-10 border-t border-black/5 pt-6">
        <DeleteBatchButton batchId={batch.id} studentCount={batch._count.students} />
      </div>
    </div>
  );
}
