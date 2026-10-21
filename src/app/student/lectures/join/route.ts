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

export const dynamic = "force-dynamic";

// The Zoom link is never put in the page's HTML. Pressing Join comes here: we
// check this student's batch and that class is open right now, record the
// attendance, and only then send them on to Zoom.
export async function GET(request: Request) {
  const base = siteUrl();
  const session = await auth();
  if (!session?.user) {
    return NextResponse.redirect(new URL("/login", base));
  }

  const url = new URL(request.url);
  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true, batchId: true },
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

  if (!previewId && me.role === "STUDENT") {
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

  const response = NextResponse.redirect(batch.zoomJoinUrl);
  response.headers.set("Cache-Control", "no-store");
  return response;
}
