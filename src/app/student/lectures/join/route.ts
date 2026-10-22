import { NextResponse } from "next/server";

import { auth } from "@/auth";
import {
  addDays,
  joinState,
  sessionsBetween,
  siteUrl,
  todayIst,
  ymdToDate,
} from "@/lib/lectures";
import { prisma } from "@/lib/prisma";
import { meetingIdFromJoinUrl } from "@/lib/zoom-webhook";
import { registerParticipant } from "@/lib/zoom-api";

export const dynamic = "force-dynamic";

// The Zoom link is never put in the page's HTML. Pressing Join comes here: we
// check this student's batch and that class is open right now, then send them
// to Zoom. If the batch uses personal links, the student is sent to their OWN
// link (created on first use) so Zoom knows exactly who joined and the link
// is useless to anyone else.
export async function GET(request: Request) {
  const base = siteUrl();
  const session = await auth();
  if (!session?.user) {
    return NextResponse.redirect(new URL("/login", base));
  }

  const url = new URL(request.url);
  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, role: true, batchId: true },
  });
  if (!me) return NextResponse.redirect(new URL("/login", base));

  const previewId = me.role === "ADMIN" ? url.searchParams.get("batch") : null;
  const batchId = previewId ?? me.batchId;
  const back = (notice?: string) => {
    const target = new URL("/student/lectures", base);
    if (notice) target.searchParams.set("notice", notice);
    if (previewId) target.searchParams.set("batch", previewId);
    return NextResponse.redirect(target);
  };
  if (!batchId) return back();

  const batch = await prisma.batch.findUnique({ where: { id: batchId } });
  if (!batch || !batch.active) return back();

  const today = todayIst();
  const overrides = await prisma.classOverride.findMany({
    where: { batchId: batch.id, classDate: ymdToDate(today) },
  });
  const open = sessionsBetween(batch, overrides, addDays(today, -1), today).find(
    (s) => joinState(s) === "open"
  );
  if (!open) return back("not-open");

  const isStudentJoin = !previewId && me.role === "STUDENT";

  // Decide where to send them. Admins previewing always get the shared link.
  let destination = batch.zoomJoinUrl;
  if (batch.personalLinks && isStudentJoin) {
    const existing = await prisma.batchRegistration.findUnique({
      where: { userId_batchId: { userId: me.id, batchId: batch.id } },
      select: { joinUrl: true },
    });
    if (existing) {
      destination = existing.joinUrl;
    } else {
      const meetingId = meetingIdFromJoinUrl(batch.zoomJoinUrl);
      const registered = meetingId
        ? await registerParticipant({ meetingId, email: me.email, name: me.name })
        : null;
      if (!registered || !registered.ok) {
        // Deliberately NOT falling back to the shared link: that would quietly
        // defeat the point of personal links. The admin can switch them off
        // for a batch in an emergency.
        console.error(
          "Personal Zoom link failed for batch",
          batch.id,
          registered && !registered.ok ? registered.code : "no meeting id"
        );
        return back("link-error");
      }
      await prisma.batchRegistration.upsert({
        where: { userId_batchId: { userId: me.id, batchId: batch.id } },
        create: {
          userId: me.id,
          batchId: batch.id,
          zoomRegistrantId: registered.registrantId,
          joinUrl: registered.joinUrl,
        },
        update: {
          zoomRegistrantId: registered.registrantId,
          joinUrl: registered.joinUrl,
        },
      });
      destination = registered.joinUrl;
    }
  }

  if (isStudentJoin) {
    await prisma.lectureJoin.upsert({
      where: {
        userId_batchId_classDate: {
          userId: me.id,
          batchId: batch.id,
          classDate: ymdToDate(open.date),
        },
      },
      create: { userId: me.id, batchId: batch.id, classDate: ymdToDate(open.date) },
      update: {},
    });
  }

  const response = NextResponse.redirect(destination);
  response.headers.set("Cache-Control", "no-store");
  return response;
}
