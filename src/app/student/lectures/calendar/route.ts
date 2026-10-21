import { auth } from "@/auth";
import {
  addDays,
  ICAL_DAYS,
  siteUrl,
  todayIst,
  weekdayOf,
} from "@/lib/lectures";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// iCalendar text values must escape backslashes, commas, semicolons, newlines.
const esc = (s: string) =>
  s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");

const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

// A single repeating event for the batch's weekly schedule, so a student adds
// the whole timetable to their phone calendar once. The event points at the
// lectures page; the Zoom link itself is not put in the file.
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) return new Response("Unauthorized", { status: 401 });

  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, batchId: true },
  });
  const previewId =
    me?.role === "ADMIN" ? new URL(request.url).searchParams.get("batch") : null;
  const batchId = previewId ?? me?.batchId;
  if (!batchId) return new Response("No batch", { status: 404 });

  const batch = await prisma.batch.findUnique({ where: { id: batchId } });
  if (!batch || batch.days.length === 0) return new Response("No schedule", { status: 404 });

  // First occurrence: the next scheduled weekday from today (IST).
  let first = todayIst();
  for (let i = 0; i < 7 && !batch.days.includes(weekdayOf(first)); i++) {
    first = addDays(first, 1);
  }
  const [h, m] = batch.startTime.split(":").map(Number);
  const endMinutes = h * 60 + m + batch.durationMinutes;
  const endDay = endMinutes >= 24 * 60 ? addDays(first, 1) : first;
  const endClock = `${String(Math.floor((endMinutes % (24 * 60)) / 60)).padStart(2, "0")}${String(endMinutes % 60).padStart(2, "0")}`;
  const ymd = (d: string) => d.replace(/-/g, "");
  const link = `${siteUrl()}/student/lectures`;

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//MBAProf Tests//Live classes//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VTIMEZONE",
    "TZID:Asia/Kolkata",
    "BEGIN:STANDARD",
    "DTSTART:19700101T000000",
    "TZOFFSETFROM:+0530",
    "TZOFFSETTO:+0530",
    "TZNAME:IST",
    "END:STANDARD",
    "END:VTIMEZONE",
    "BEGIN:VEVENT",
    `UID:batch-${batch.id}@tests.mbaprof.in`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART;TZID=Asia/Kolkata:${ymd(first)}T${String(h).padStart(2, "0")}${String(m).padStart(2, "0")}00`,
    `DTEND;TZID=Asia/Kolkata:${ymd(endDay)}T${endClock}00`,
    `RRULE:FREQ=WEEKLY;BYDAY=${batch.days.map((d) => ICAL_DAYS[d]).join(",")}`,
    `SUMMARY:${esc(`${batch.name} - live class`)}`,
    `DESCRIPTION:${esc(`Join from your Live classes page: ${link}`)}`,
    `URL:${link}`,
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    "DESCRIPTION:Class starts in 15 minutes",
    "TRIGGER:-PT15M",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return new Response(lines.join("\r\n") + "\r\n", {
    headers: {
      "content-type": "text/calendar; charset=utf-8",
      "content-disposition": 'attachment; filename="live-classes.ics"',
      "cache-control": "no-store",
    },
  });
}
