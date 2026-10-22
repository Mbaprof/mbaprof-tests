import type { Metadata } from "next";
import Link from "next/link";

import { auth } from "@/auth";
import {
  addDays,
  dateToYmd,
  formatClock,
  formatDay,
  formatLongDay,
  joinOpensAt,
  joinState,
  relativeDay,
  sessionsBetween,
  todayIst,
  ymdToDate,
  daysSummary,
  istInstant,
} from "@/lib/lectures";
import { prisma } from "@/lib/prisma";

import { Countdown, CopyButton } from "./live-bits";

export const metadata: Metadata = { title: "Live classes | MBAProf Tests" };

const PAGE_SIZE = 12;

type SearchParams = {
  batch?: string;
  q?: string;
  page?: string;
  notice?: string;
};

export default async function LecturesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const session = await auth();

  const me = await prisma.user.findUnique({
    where: { id: session!.user.id },
    select: { role: true, batch: true },
  });
  const isAdmin = me?.role === "ADMIN";
  const previewId = isAdmin ? sp.batch : undefined;
  const batch = previewId
    ? await prisma.batch.findUnique({ where: { id: previewId } })
    : me?.batch ?? null;

  if (!batch || !batch.active) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-brand-navy">Live classes</h1>
        <div className="mt-8 rounded-xl border border-dashed border-brand-navy/20 bg-white p-10 text-center text-brand-ink/70">
          {isAdmin ? (
            <>
              Pick a batch to preview its student view.{" "}
              <Link href="/admin/batches" className="font-semibold text-brand-navy hover:underline">
                Go to batches
              </Link>
            </>
          ) : batch && !batch.active ? (
            "Your batch is not running classes right now. We'll let you know when it starts."
          ) : (
            "You haven't been placed in a batch yet. Please contact us and we'll add you."
          )}
        </div>
      </div>
    );
  }

  const today = todayIst();
  const q = (sp.q ?? "").trim().slice(0, 80);
  const page = Math.max(1, Math.floor(Number(sp.page)) || 1);
  const recordingWhere = {
    batchId: batch.id,
    published: true,
    recordingUrl: { not: null },
    ...(q ? { topic: { contains: q, mode: "insensitive" as const } } : {}),
  };

  const [overrides, recordingCount, recordings, weekTopics] = await Promise.all([
    prisma.classOverride.findMany({
      where: { batchId: batch.id, classDate: { gte: ymdToDate(today) } },
    }),
    prisma.lecture.count({ where: recordingWhere }),
    prisma.lecture.findMany({
      where: recordingWhere,
      orderBy: [{ classDate: "desc" }, { part: "asc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    // Planned topics for the coming week (topic-only rows count too).
    prisma.lecture.findMany({
      where: {
        batchId: batch.id,
        published: true,
        topic: { not: null },
        classDate: { gte: ymdToDate(today), lte: ymdToDate(addDays(today, 7)) },
      },
      orderBy: { part: "asc" },
      select: { classDate: true, topic: true },
    }),
  ]);

  const topicByDate = new Map<string, string>();
  for (const t of weekTopics) {
    const d = dateToYmd(t.classDate);
    if (t.topic && !topicByDate.has(d)) topicByDate.set(d, t.topic);
  }

  const now = new Date();
  const week = sessionsBetween(batch, overrides, today, addDays(today, 7));
  const upcoming = week.filter((s) => {
    const state = joinState(s, now);
    return state === "open" || state === "upcoming";
  });
  const current = upcoming[0];
  const currentState = current ? joinState(current, now) : null;
  const todaysCancelled = week.find((s) => s.date === today && s.status === "cancelled");

  const joinHref = previewId
    ? `/student/lectures/join?batch=${batch.id}`
    : "/student/lectures/join";
  const pageCount = Math.max(1, Math.ceil(recordingCount / PAGE_SIZE));
  const qs = (overrides: Record<string, string | number | undefined>) => {
    const p = new URLSearchParams();
    const merged: Record<string, string | number | undefined> = {
      batch: previewId,
      q,
      ...overrides,
    };
    for (const [k, v] of Object.entries(merged)) {
      const text = v === undefined ? "" : String(v);
      if (text !== "" && !(k === "page" && text === "1")) p.set(k, text);
    }
    const s = p.toString();
    return s ? `?${s}` : "";
  };

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">Live classes</h1>
          <p className="mt-1 text-sm text-brand-ink/60">
            {batch.name} · {daysSummary(batch.days)} ·{" "}
            {formatClock(istInstant(today, batch.startTime))} IST
            {previewId && " · (admin preview)"}
          </p>
        </div>
        <a
          href={`/student/lectures/calendar${previewId ? `?batch=${batch.id}` : ""}`}
          className="whitespace-nowrap rounded-md border border-brand-navy/20 px-4 py-2 text-sm font-semibold text-brand-navy transition-colors hover:bg-brand-navy hover:text-white"
        >
          Add to calendar
        </a>
      </div>

      {sp.notice === "link-error" && (
        <p className="mt-6 rounded-md bg-red-50 px-4 py-3 text-sm text-red-800">
          We couldn&apos;t prepare your personal class link just now. Please press Join again in
          a moment, and tell us if it keeps happening.
        </p>
      )}

      {sp.notice === "not-open" && (
        <p className="mt-6 rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-800">
          The class isn&apos;t open yet. Joining unlocks 15 minutes before it starts.
        </p>
      )}

      {/* Next / live class */}
      <section className="mt-6 overflow-hidden rounded-xl border border-black/5 bg-white">
        {current && currentState === "open" ? (
          <div className="bg-brand-navy p-5 text-white sm:p-6">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-brand-gold-light">
              <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
              Class is open
            </p>
            <p className="mt-2 text-xl font-bold">
              {relativeDay(current.date, today)} · {formatClock(current.start)} -{" "}
              {formatClock(current.end)}
            </p>
            {topicByDate.get(current.date) && (
              <p className="mt-1 text-sm font-medium text-brand-gold-light">
                Topic: {topicByDate.get(current.date)}
              </p>
            )}
            {current.note && <p className="mt-1 text-sm text-white/80">{current.note}</p>}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <a
                href={joinHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center rounded-md bg-brand-gold px-6 py-2.5 text-sm font-bold text-brand-navy transition-colors hover:bg-brand-gold-light"
              >
                Join class on Zoom
              </a>
              {batch.zoomPasscode && !batch.personalLinks && (
                <span className="flex items-center gap-2 text-sm text-white/90">
                  Passcode if asked: <strong>{batch.zoomPasscode}</strong>
                  <CopyButton text={batch.zoomPasscode} onDark />
                </span>
              )}
            </div>
            <p className="mt-3 text-xs text-white/60">
              {batch.personalLinks
                ? "This is your personal link, made just for you. Please don't share it - it won't work for anyone else while you are in class."
                : "It opens in the Zoom app or your browser. Please join with your own name."}
            </p>
          </div>
        ) : current ? (
          <div className="p-5 sm:p-6">
            <p className="heading-flag text-xs font-semibold uppercase tracking-wide text-brand-navy">
              Next class
            </p>
            <p className="mt-2 text-xl font-bold text-brand-navy">
              {relativeDay(current.date, today)} · {formatClock(current.start)} -{" "}
              {formatClock(current.end)}
            </p>
            {topicByDate.get(current.date) && (
              <p className="mt-1 text-sm font-medium text-brand-navy">
                Topic: {topicByDate.get(current.date)}
              </p>
            )}
            {current.note && (
              <p className="mt-1 text-sm text-brand-ink/70">{current.note}</p>
            )}
            <p className="mt-3 text-sm text-brand-ink/70">
              <Countdown targetIso={joinOpensAt(current).toISOString()} label="Join opens in" />
              {" "}
              <span className="text-brand-ink/50">
                (15 minutes before the start)
              </span>
            </p>
            <span
              aria-disabled="true"
              className="mt-4 inline-flex min-h-11 cursor-not-allowed items-center rounded-md bg-black/10 px-6 py-2.5 text-sm font-semibold text-brand-ink/40"
            >
              Join class on Zoom
            </span>
          </div>
        ) : (
          <div className="p-5 text-sm text-brand-ink/70 sm:p-6">
            No class is scheduled in the next 7 days.
          </div>
        )}
        {todaysCancelled && (
          <p className="border-t border-black/5 bg-red-50 px-5 py-3 text-sm text-red-800 sm:px-6">
            Today&apos;s class is cancelled
            {todaysCancelled.note ? `: ${todaysCancelled.note}` : "."}
          </p>
        )}
      </section>

      {/* This week */}
      <section className="mt-8">
        <h2 className="text-base font-semibold text-brand-navy">This week</h2>
        {week.length === 0 ? (
          <p className="mt-3 text-sm text-brand-ink/60">No classes this week.</p>
        ) : (
          <ul className="mt-3 divide-y divide-black/5 overflow-hidden rounded-xl border border-black/5 bg-white">
            {week.map((s) => (
              <li
                key={s.date}
                className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm"
              >
                <span className="font-medium text-brand-ink">
                  {relativeDay(s.date, today)}
                  {s.date === today || s.date === addDays(today, 1) || s.date === addDays(today, -1)
                    ? ` (${formatDay(s.date)})`
                    : ""}
                </span>
                {s.status === "cancelled" ? (
                  <span className="font-semibold text-red-700">
                    Cancelled{s.note ? ` - ${s.note}` : ""}
                  </span>
                ) : (
                  <span className="text-brand-ink/70">
                    {formatClock(s.start)} - {formatClock(s.end)}
                    {s.status === "changed" && (
                      <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                        Changed
                      </span>
                    )}
                  </span>
                )}
                {s.status !== "cancelled" && topicByDate.get(s.date) && (
                  <p className="w-full text-xs text-brand-ink/70">
                    <span className="font-semibold text-brand-navy">Topic:</span>{" "}
                    {topicByDate.get(s.date)}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Recordings */}
      <section className="mt-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-base font-semibold text-brand-navy">
            Recordings of past classes
          </h2>
          <form method="get" className="flex w-full gap-2 sm:w-auto">
            {previewId && <input type="hidden" name="batch" value={previewId} />}
            <input
              name="q"
              defaultValue={q}
              placeholder="Search by topic"
              className="min-w-0 flex-1 rounded-md border border-black/10 bg-white px-3 py-2 text-sm focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy sm:w-56"
            />
            <button
              type="submit"
              className="cursor-pointer rounded-md border border-brand-navy/20 px-4 py-2 text-sm font-semibold text-brand-navy hover:bg-brand-navy hover:text-white"
            >
              Search
            </button>
          </form>
        </div>

        {recordings.length === 0 ? (
          <div className="mt-3 rounded-xl border border-dashed border-brand-navy/20 bg-white p-8 text-center text-sm text-brand-ink/60">
            {q ? "No recordings match that search." : "Recordings will appear here after each class."}
          </div>
        ) : (
          <ul className="mt-3 divide-y divide-black/5 overflow-hidden rounded-xl border border-black/5 bg-white">
            {recordings.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-4">
                <div className="min-w-0">
                  <p className="font-medium text-brand-ink">
                    {r.topic || "Class recording"}
                    {r.part > 1 ? ` (Part ${r.part})` : ""}
                  </p>
                  <p className="text-xs text-brand-ink/60">
                    {formatLongDay(dateToYmd(r.classDate))}
                  </p>
                  {r.recordingPasscode && (
                    <p className="mt-1 flex items-center gap-2 text-xs text-brand-ink/70">
                      Passcode: <strong>{r.recordingPasscode}</strong>
                      <CopyButton text={r.recordingPasscode} />
                    </p>
                  )}
                </div>
                <a
                  href={r.recordingUrl ?? "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-10 items-center rounded-md bg-brand-navy px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-navy-light"
                >
                  Watch recording
                </a>
              </li>
            ))}
          </ul>
        )}

        {pageCount > 1 && (
          <div className="mt-4 flex items-center justify-between text-sm">
            {page > 1 ? (
              <Link
                href={`/student/lectures${qs({ page: page - 1 })}`}
                className="rounded-md border border-black/10 bg-white px-3 py-1.5 font-medium text-brand-navy hover:bg-brand-cream"
              >
                Newer
              </Link>
            ) : (
              <span />
            )}
            <span className="text-brand-ink/60">
              Page {page} of {pageCount}
            </span>
            {page < pageCount ? (
              <Link
                href={`/student/lectures${qs({ page: page + 1 })}`}
                className="rounded-md border border-black/10 bg-white px-3 py-1.5 font-medium text-brand-navy hover:bg-brand-cream"
              >
                Older
              </Link>
            ) : (
              <span />
            )}
          </div>
        )}
      </section>
    </div>
  );
}
