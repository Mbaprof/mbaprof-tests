import { z } from "zod";

import { MBA_ENTRANCE_EXAMS } from "@/lib/validation";

// ---- Weekdays (0 = Sunday ... 6 = Saturday), shown Monday first ------------

export const WEEKDAYS = [
  { value: 1, short: "Mon", long: "Monday" },
  { value: 2, short: "Tue", long: "Tuesday" },
  { value: 3, short: "Wed", long: "Wednesday" },
  { value: 4, short: "Thu", long: "Thursday" },
  { value: 5, short: "Fri", long: "Friday" },
  { value: 6, short: "Sat", long: "Saturday" },
  { value: 0, short: "Sun", long: "Sunday" },
] as const;

export const ICAL_DAYS = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

export function daysSummary(days: number[]) {
  const set = new Set(days);
  const ordered = WEEKDAYS.filter((d) => set.has(d.value));
  if (ordered.length === 7) return "Every day";
  if (ordered.length === 6 && !set.has(0)) return "Mon-Sat";
  if (ordered.length === 5 && !set.has(0) && !set.has(6)) return "Mon-Fri";
  return ordered.map((d) => d.short).join(", ");
}

// ---- IST date/time helpers ---------------------------------------------------
// All class times are Indian Standard Time, which has no daylight saving, so a
// fixed +05:30 offset is exact. Dates travel as "YYYY-MM-DD" strings.

const IST_OFFSET = "+05:30";

export const JOIN_OPENS_MIN_BEFORE = 15;
export const JOIN_CLOSES_MIN_AFTER_END = 30;

export function todayIst(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(now);
}

export function addDays(ymd: string, n: number) {
  const d = new Date(`${ymd}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export function weekdayOf(ymd: string) {
  return new Date(`${ymd}T00:00:00Z`).getUTCDay();
}

export function istInstant(ymd: string, hhmm: string) {
  return new Date(`${ymd}T${hhmm}:00${IST_OFFSET}`);
}

// Prisma `@db.Date` columns round-trip as UTC-midnight Dates.
export const ymdToDate = (ymd: string) => new Date(`${ymd}T00:00:00Z`);
export const dateToYmd = (d: Date) => d.toISOString().slice(0, 10);

export function isValidYmd(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

const timeFormat = new Intl.DateTimeFormat("en-IN", {
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
  timeZone: "Asia/Kolkata",
});
const dayFormat = new Intl.DateTimeFormat("en-IN", {
  weekday: "short",
  day: "numeric",
  month: "short",
  timeZone: "Asia/Kolkata",
});
const longDayFormat = new Intl.DateTimeFormat("en-IN", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Asia/Kolkata",
});

export const formatClock = (d: Date) => timeFormat.format(d).toLowerCase();
export const formatDay = (ymd: string) => dayFormat.format(istInstant(ymd, "12:00"));
export const formatLongDay = (ymd: string) => longDayFormat.format(istInstant(ymd, "12:00"));

export function relativeDay(ymd: string, today = todayIst()) {
  if (ymd === today) return "Today";
  if (ymd === addDays(today, 1)) return "Tomorrow";
  if (ymd === addDays(today, -1)) return "Yesterday";
  return formatDay(ymd);
}

// ---- Sessions -------------------------------------------------------------------

export type BatchSchedule = {
  days: number[];
  startTime: string;
  durationMinutes: number;
};

export type OverrideRow = {
  classDate: Date;
  kind: string;
  startTime: string | null;
  durationMinutes: number | null;
  note: string | null;
};

export type SessionStatus = "scheduled" | "cancelled" | "changed";

export type ClassSession = {
  date: string; // YYYY-MM-DD (IST)
  start: Date;
  end: Date;
  durationMinutes: number;
  status: SessionStatus;
  note: string | null;
};

// Every class day between two dates (inclusive), with cancellations and
// one-off changes applied. A CUSTOM override on a day the batch normally has no
// class is an extra class.
export function sessionsBetween(
  schedule: BatchSchedule,
  overrides: OverrideRow[],
  fromYmd: string,
  toYmd: string
): ClassSession[] {
  const byDate = new Map(overrides.map((o) => [dateToYmd(o.classDate), o]));
  const out: ClassSession[] = [];

  for (let d = fromYmd; d <= toYmd; d = addDays(d, 1)) {
    const override = byDate.get(d);
    const regular = schedule.days.includes(weekdayOf(d));
    if (!regular && override?.kind !== "CUSTOM") continue;

    if (override?.kind === "CANCELLED") {
      const start = istInstant(d, schedule.startTime);
      out.push({
        date: d,
        start,
        end: new Date(start.getTime() + schedule.durationMinutes * 60_000),
        durationMinutes: schedule.durationMinutes,
        status: "cancelled",
        note: override.note,
      });
      continue;
    }

    const startTime = override?.startTime ?? schedule.startTime;
    const duration = override?.durationMinutes ?? schedule.durationMinutes;
    const start = istInstant(d, startTime);
    out.push({
      date: d,
      start,
      end: new Date(start.getTime() + duration * 60_000),
      durationMinutes: duration,
      status: override?.kind === "CUSTOM" ? "changed" : "scheduled",
      note: override?.note ?? null,
    });
  }
  return out;
}

export type JoinState = "cancelled" | "upcoming" | "open" | "ended";

export function joinState(session: ClassSession, now = new Date()): JoinState {
  if (session.status === "cancelled") return "cancelled";
  const opens = session.start.getTime() - JOIN_OPENS_MIN_BEFORE * 60_000;
  const closes = session.end.getTime() + JOIN_CLOSES_MIN_AFTER_END * 60_000;
  const t = now.getTime();
  if (t < opens) return "upcoming";
  if (t <= closes) return "open";
  return "ended";
}

export const joinOpensAt = (session: ClassSession) =>
  new Date(session.start.getTime() - JOIN_OPENS_MIN_BEFORE * 60_000);

// ---- Validation -----------------------------------------------------------------

const isZoomHost = (value: string) => {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return false;
    return /(^|\.)zoom\.(us|com)$|(^|\.)zoomgov\.com$/.test(url.hostname);
  } catch {
    return false;
  }
};

const isHttpsUrl = (value: string) => {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
};

const hhmm = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use a time like 19:00");

export const batchSchema = z.object({
  name: z.string().trim().min(2, "Give the batch a name").max(80),
  targetExam: z.enum(MBA_ENTRANCE_EXAMS, { message: "Select the exam for this batch" }),
  zoomJoinUrl: z
    .string()
    .trim()
    .refine(isZoomHost, "Paste the full https Zoom meeting link (zoom.us)"),
  zoomPasscode: z.string().trim().max(40).optional(),
  days: z
    .array(z.number().int().min(0).max(6))
    .min(1, "Pick at least one class day"),
  startTime: hhmm,
  durationMinutes: z.coerce.number().int().min(15, "At least 15 minutes").max(480),
  active: z.boolean(),
});
export type BatchInput = z.infer<typeof batchSchema>;

const ymd = z.string().refine(isValidYmd, "Pick a valid date");

export const lectureSchema = z.object({
  classDate: ymd,
  topic: z.string().trim().max(150).optional(),
  recordingUrl: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || isHttpsUrl(v), "Recording link must start with https://"),
  recordingPasscode: z.string().trim().max(60).optional(),
  published: z.boolean(),
});
export type LectureInput = z.infer<typeof lectureSchema>;

export const overrideSchema = z
  .object({
    classDate: ymd,
    kind: z.enum(["CANCELLED", "CUSTOM"]),
    startTime: hhmm.optional().or(z.literal("")),
    durationMinutes: z.coerce.number().int().min(15).max(480).optional(),
    note: z.string().trim().max(200).optional(),
  })
  .refine((v) => v.kind !== "CUSTOM" || !!v.startTime, {
    message: "Choose the start time for the changed class",
    path: ["startTime"],
  });
export type OverrideInput = z.infer<typeof overrideSchema>;

export function siteUrl() {
  return (process.env.AUTH_URL ?? "https://tests.mbaprof.in").replace(/\/$/, "");
}
