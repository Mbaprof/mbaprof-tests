import { NextResponse } from "next/server";

import { dateToYmd, todayIst, ymdToDate } from "@/lib/lectures";
import { prisma } from "@/lib/prisma";
import {
  meetingIdFromJoinUrl,
  parseRecordingCompleted,
  urlValidationResponse,
  verifyZoomSignature,
} from "@/lib/zoom-webhook";

export const dynamic = "force-dynamic";

// Receives Zoom's "recording finished" notifications and files each recording
// under the right batch and class day. Public URL, protected by Zoom's
// signature: anything not signed with our secret token is rejected.
export async function POST(request: Request) {
  const secret = process.env.ZOOM_WEBHOOK_SECRET_TOKEN;
  if (!secret) {
    console.error("Zoom webhook called but ZOOM_WEBHOOK_SECRET_TOKEN is not set");
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const rawBody = await request.text();
  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  // Zoom's one-off ownership check when the endpoint URL is saved in their portal.
  if (
    typeof body === "object" &&
    body !== null &&
    (body as { event?: unknown }).event === "endpoint.url_validation"
  ) {
    const plain = (body as { payload?: { plainToken?: unknown } }).payload?.plainToken;
    if (typeof plain !== "string") {
      return NextResponse.json({ error: "Bad request" }, { status: 400 });
    }
    return NextResponse.json(urlValidationResponse(secret, plain));
  }

  const valid = verifyZoomSignature({
    secret,
    timestamp: request.headers.get("x-zm-request-timestamp"),
    signature: request.headers.get("x-zm-signature"),
    rawBody,
  });
  if (!valid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const recording = parseRecordingCompleted(body);
  if (!recording) {
    // Some other event type, or a payload we cannot use: acknowledge, do nothing.
    return NextResponse.json({ ok: true, ignored: "not a usable recording event" });
  }

  try {
    const batches = await prisma.batch.findMany({
      select: { id: true, zoomJoinUrl: true },
    });
    const batch = batches.find(
      (b) => meetingIdFromJoinUrl(b.zoomJoinUrl) === recording.meetingId
    );
    if (!batch) {
      return NextResponse.json({ ok: true, ignored: "meeting does not belong to a batch" });
    }

    const classDate = ymdToDate(todayIst(recording.startTime));
    const data = {
      recordingUrl: recording.shareUrl,
      recordingPasscode: recording.passcode,
      durationMinutes: recording.durationMinutes,
    };

    // Zoom retries deliveries, so the same recording may arrive more than once.
    const already = await prisma.lecture.findUnique({
      where: { zoomUuid: recording.uuid },
      select: { id: true },
    });
    if (already) {
      await prisma.lecture.update({ where: { id: already.id }, data });
      return NextResponse.json({ ok: true, updated: true });
    }

    const sameDay = await prisma.lecture.findMany({
      where: { batchId: batch.id, classDate },
      orderBy: { part: "asc" },
      select: { id: true, part: true, recordingUrl: true, zoomUuid: true },
    });

    // An admin may have already added the topic for today with no link yet:
    // attach the recording to that row instead of creating a second one.
    const placeholder = sameDay.find((l) => !l.recordingUrl && !l.zoomUuid);
    if (placeholder) {
      await prisma.lecture.update({
        where: { id: placeholder.id },
        data: { ...data, zoomUuid: recording.uuid },
      });
      return NextResponse.json({ ok: true, filled: true });
    }

    const part = sameDay.reduce((max, l) => Math.max(max, l.part), 0) + 1;
    await prisma.lecture.create({
      data: {
        batchId: batch.id,
        classDate,
        part,
        zoomUuid: recording.uuid,
        ...data,
      },
    });
    console.log(
      `Zoom recording filed: batch ${batch.id}, ${dateToYmd(classDate)}, part ${part}`
    );
    return NextResponse.json({ ok: true, created: true, part });
  } catch (error) {
    console.error("Failed to file Zoom recording:", error);
    // A 500 makes Zoom retry later.
    return NextResponse.json({ error: "Could not save" }, { status: 500 });
  }
}
