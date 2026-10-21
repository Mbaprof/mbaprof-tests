"use server";

import { redirect } from "next/navigation";

import { getAdminSession } from "@/lib/admin";
import {
  batchSchema,
  lectureSchema,
  overrideSchema,
  type BatchInput,
  type LectureInput,
  type OverrideInput,
  ymdToDate,
} from "@/lib/lectures";
import { prisma } from "@/lib/prisma";

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
