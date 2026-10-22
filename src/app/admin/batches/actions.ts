"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { getAdminSession } from "@/lib/admin";
import {
  batchSchema,
  isValidYmd,
  lectureSchema,
  overrideSchema,
  type BatchInput,
  type LectureInput,
  type OverrideInput,
  ymdToDate,
} from "@/lib/lectures";
import { prisma } from "@/lib/prisma";
import { cancelRegistrants, registerParticipant, zoomApiConfigured } from "@/lib/zoom-api";
import { meetingIdFromJoinUrl } from "@/lib/zoom-webhook";

export type ActionState = { error?: string; ok?: boolean } | undefined;

async function requireAdminUser() {
  const session = await getAdminSession();
  if (!session) redirect("/login");
  return session.user;
}

const firstError = (issues: { message: string }[]) =>
  issues[0]?.message ?? "Please check the form";

const cleanDays = (days: number[]) => [...new Set(days)].sort((a, b) => a - b);

// ---- Batches ----------------------------------------------------------------------

export async function createBatch(input: BatchInput): Promise<ActionState> {
  await requireAdminUser();
  const parsed = batchSchema.safeParse(input);
  if (!parsed.success) return { error: firstError(parsed.error.issues) };

  let id: string;
  try {
    const batch = await prisma.batch.create({
      data: {
        ...parsed.data,
        zoomPasscode: parsed.data.zoomPasscode || null,
        days: cleanDays(parsed.data.days),
      },
      select: { id: true },
    });
    id = batch.id;
  } catch (error) {
    console.error("Failed to create batch:", error);
    return { error: "Could not save the batch. Please try again." };
  }
  redirect(`/admin/batches/${id}`);
}

export async function updateBatch(
  batchId: string,
  input: BatchInput
): Promise<ActionState> {
  await requireAdminUser();
  const parsed = batchSchema.safeParse(input);
  if (!parsed.success) return { error: firstError(parsed.error.issues) };

  try {
    await prisma.batch.update({
      where: { id: batchId },
      data: {
        ...parsed.data,
        zoomPasscode: parsed.data.zoomPasscode || null,
        days: cleanDays(parsed.data.days),
      },
    });
  } catch (error) {
    console.error("Failed to update batch:", error);
    return { error: "Could not save the batch. Please try again." };
  }
  return { ok: true };
}

// Deleting a batch also deletes its recordings list, schedule changes and
// attendance; its students are simply left without a batch.
export async function deleteBatch(batchId: string) {
  await requireAdminUser();
  await prisma.batch.delete({ where: { id: batchId } });
  redirect("/admin/batches");
}

// ---- Putting students in batches ------------------------------------------------------

// Bulk action from the Students list: <form action={assignStudentsToBatch}>.
export async function assignStudentsToBatch(formData: FormData) {
  await requireAdminUser();

  const ids = [...new Set(formData.getAll("ids").map(String))].filter(Boolean);
  const batchValue = String(formData.get("batchId") ?? "");
  const returnTo = String(formData.get("returnTo") ?? "/admin/students");
  const safeReturn = returnTo.startsWith("/admin/students") ? returnTo : "/admin/students";

  if (ids.length === 0 || !batchValue) redirect(safeReturn);

  let batchId: string | null = null;
  if (batchValue !== "none") {
    const batch = await prisma.batch.findUnique({
      where: { id: batchValue },
      select: { id: true },
    });
    if (!batch) redirect(safeReturn);
    batchId = batch.id;
  }

  // Students leaving a batch lose their personal Zoom link for it, so a link
  // they already hold stops working. Rows are only forgotten once Zoom has
  // confirmed the cancellation.
  const leaving = await prisma.batchRegistration.findMany({
    where: { userId: { in: ids }, ...(batchId ? { batchId: { not: batchId } } : {}) },
    select: {
      id: true,
      zoomRegistrantId: true,
      user: { select: { email: true } },
      batch: { select: { zoomJoinUrl: true } },
    },
  });
  if (leaving.length > 0) {
    const byMeeting = new Map<string, typeof leaving>();
    for (const row of leaving) {
      const meetingId = meetingIdFromJoinUrl(row.batch.zoomJoinUrl);
      if (!meetingId) continue;
      byMeeting.set(meetingId, [...(byMeeting.get(meetingId) ?? []), row]);
    }
    for (const [meetingId, rows] of byMeeting) {
      const result = await cancelRegistrants({
        meetingId,
        registrants: rows.map((r) => ({ id: r.zoomRegistrantId, email: r.user.email })),
      });
      if (result.ok) {
        await prisma.batchRegistration.deleteMany({ where: { id: { in: rows.map((r) => r.id) } } });
      } else {
        console.error("Could not cancel personal Zoom links:", result.code, result.message);
      }
    }
  }

  // Only ever touches student accounts.
  await prisma.user.updateMany({
    where: { id: { in: ids }, role: "STUDENT" },
    data: { batchId },
  });
  redirect(safeReturn);
}

// ---- Recordings (one row per class day) ----------------------------------------------

export async function saveLecture(
  batchId: string,
  input: LectureInput
): Promise<ActionState> {
  await requireAdminUser();
  const parsed = lectureSchema.safeParse(input);
  if (!parsed.success) return { error: firstError(parsed.error.issues) };

  const data = {
    topic: parsed.data.topic || null,
    recordingUrl: parsed.data.recordingUrl || null,
    recordingPasscode: parsed.data.recordingPasscode || null,
    published: parsed.data.published,
  };
  try {
    await prisma.lecture.upsert({
      where: {
        batchId_classDate_part: {
          batchId,
          classDate: ymdToDate(parsed.data.classDate),
          part: parsed.data.part,
        },
      },
      create: {
        batchId,
        classDate: ymdToDate(parsed.data.classDate),
        part: parsed.data.part,
        ...data,
      },
      update: data,
    });
  } catch (error) {
    console.error("Failed to save lecture:", error);
    return { error: "Could not save this lecture. Please try again." };
  }
  return { ok: true };
}

export async function deleteLecture(lectureId: string) {
  await requireAdminUser();
  await prisma.lecture.delete({ where: { id: lectureId } });
}

// ---- Planned topics for upcoming classes --------------------------------------
// A topic with no recording yet is stored as a lecture row without a link; the
// Zoom webhook later fills that same row with the recording.

export async function saveTopics(
  batchId: string,
  items: { classDate: string; topic: string }[]
): Promise<ActionState> {
  await requireAdminUser();
  if (!Array.isArray(items) || items.length === 0 || items.length > 31) {
    return { error: "Nothing to save" };
  }

  const cleaned: { classDate: string; topic: string }[] = [];
  for (const item of items) {
    const date = z.string().refine(isValidYmd).safeParse(item.classDate);
    const topic = z.string().trim().max(150, "Topics can be up to 150 characters").safeParse(item.topic ?? "");
    if (!date.success) return { error: "Pick valid dates" };
    if (!topic.success) return { error: firstError(topic.error.issues) };
    cleaned.push({ classDate: date.data, topic: topic.data });
  }

  try {
    for (const { classDate, topic } of cleaned) {
      const date = ymdToDate(classDate);
      const target = await prisma.lecture.findFirst({
        where: { batchId, classDate: date },
        orderBy: { part: "asc" },
        select: { id: true, recordingUrl: true, zoomUuid: true },
      });
      if (topic) {
        if (target) {
          await prisma.lecture.update({ where: { id: target.id }, data: { topic } });
        } else {
          await prisma.lecture.create({ data: { batchId, classDate: date, part: 1, topic } });
        }
      } else if (target) {
        if (target.recordingUrl || target.zoomUuid) {
          await prisma.lecture.update({ where: { id: target.id }, data: { topic: null } });
        } else {
          // A topic-only placeholder with nothing else on it: remove it.
          await prisma.lecture.delete({ where: { id: target.id } });
        }
      }
    }
  } catch (error) {
    console.error("Failed to save topics:", error);
    return { error: "Could not save the topics. Please try again." };
  }
  return { ok: true };
}

// ---- Cancel or change a single day --------------------------------------------------------

export async function saveOverride(
  batchId: string,
  input: OverrideInput
): Promise<ActionState> {
  await requireAdminUser();
  const parsed = overrideSchema.safeParse(input);
  if (!parsed.success) return { error: firstError(parsed.error.issues) };

  const custom = parsed.data.kind === "CUSTOM";
  const data = {
    kind: parsed.data.kind,
    startTime: custom ? parsed.data.startTime || null : null,
    durationMinutes: custom ? parsed.data.durationMinutes ?? null : null,
    note: parsed.data.note || null,
  };
  try {
    await prisma.classOverride.upsert({
      where: {
        batchId_classDate: { batchId, classDate: ymdToDate(parsed.data.classDate) },
      },
      create: { batchId, classDate: ymdToDate(parsed.data.classDate), ...data },
      update: data,
    });
  } catch (error) {
    console.error("Failed to save class change:", error);
    return { error: "Could not save this change. Please try again." };
  }
  return { ok: true };
}

export async function deleteOverride(overrideId: string) {
  await requireAdminUser();
  await prisma.classOverride.delete({ where: { id: overrideId } });
}

// ---- Personal Zoom links ---------------------------------------------------------------

export type PrepareResult = {
  error?: string;
  processed: number;
  failed: number;
  remaining: number;
};

const pause = (ms: number) => new Promise((r) => setTimeout(r, ms));

const missingLink = (batchId: string) => ({
  batchId,
  role: "STUDENT" as const,
  zoomRegistrations: { none: { batchId } },
});

// Creates personal links for up to 25 students who do not have one yet. The
// admin page calls this repeatedly until nobody is left, so a batch is ready
// before class instead of every student triggering a Zoom request at 7:00 pm.
export async function prepareLinks(batchId: string): Promise<PrepareResult> {
  await requireAdminUser();
  const none = { processed: 0, failed: 0, remaining: 0 };

  const batch = await prisma.batch.findUnique({
    where: { id: batchId },
    select: { zoomJoinUrl: true },
  });
  if (!batch) return { ...none, error: "Batch not found." };
  const meetingId = meetingIdFromJoinUrl(batch.zoomJoinUrl);
  if (!meetingId) return { ...none, error: "The Zoom link on this batch has no meeting number." };
  if (!zoomApiConfigured()) {
    return { ...none, error: "The Zoom connection is not set up on the server yet." };
  }

  const pending = await prisma.user.findMany({
    where: missingLink(batchId),
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" },
    take: 25,
  });

  let processed = 0;
  let failed = 0;
  let firstError: string | undefined;
  for (const student of pending) {
    const result = await registerParticipant({
      meetingId,
      email: student.email,
      name: student.name,
    });
    if (result.ok) {
      await prisma.batchRegistration.upsert({
        where: { userId_batchId: { userId: student.id, batchId } },
        create: {
          userId: student.id,
          batchId,
          zoomRegistrantId: result.registrantId,
          joinUrl: result.joinUrl,
        },
        update: { zoomRegistrantId: result.registrantId, joinUrl: result.joinUrl },
      });
      processed += 1;
    } else {
      failed += 1;
      firstError ??= result.message;
      // Setup problems will fail for everyone: stop and tell the admin.
      if (result.code !== "zoom_error" && result.code !== "rate_limited") {
        const remaining = await prisma.user.count({ where: missingLink(batchId) });
        return { processed, failed, remaining, error: result.message };
      }
    }
    await pause(150);
  }

  const remaining = await prisma.user.count({ where: missingLink(batchId) });
  return {
    processed,
    failed,
    remaining,
    error: failed > 0 && processed === 0 ? firstError : undefined,
  };
}

// Registers the admin themself and immediately cancels it again: proves the
// Zoom connection, permissions and the meeting's Registration setting work,
// without touching any student.
export async function testPersonalLink(
  batchId: string
): Promise<{ ok: boolean; message: string }> {
  const admin = await requireAdminUser();
  const batch = await prisma.batch.findUnique({
    where: { id: batchId },
    select: { zoomJoinUrl: true },
  });
  if (!batch) return { ok: false, message: "Batch not found." };
  const meetingId = meetingIdFromJoinUrl(batch.zoomJoinUrl);
  if (!meetingId) {
    return { ok: false, message: "The Zoom link on this batch has no meeting number." };
  }
  const me = await prisma.user.findUnique({
    where: { id: admin.id },
    select: { name: true, email: true },
  });
  if (!me) return { ok: false, message: "Could not find your account." };

  const result = await registerParticipant({ meetingId, email: me.email, name: me.name });
  if (!result.ok) return { ok: false, message: result.message };

  await cancelRegistrants({
    meetingId,
    registrants: [{ id: result.registrantId, email: me.email }],
  });
  return {
    ok: true,
    message: "Working. Zoom created a personal link for you (and it was cancelled again, nothing is left over).",
  };
}
