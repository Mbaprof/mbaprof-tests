import bcrypt from "bcryptjs";
import { after, NextResponse } from "next/server";

import { sendEnrollmentWelcomeEmail, sendNewLeadNotification, sendNewStudentNotification } from "@/lib/email";
import {
  allowedOrigins,
  codeIsValid,
  ENROLL_CODE,
  enrollBatch,
  enrollSchema,
  newPassword,
  type EnrollData,
} from "@/lib/enroll";
import { siteUrl } from "@/lib/lectures";
import { normalizePhone, type LeadData } from "@/lib/leads";
import { rateLimited, saveLead, sendLeadWebhook } from "@/lib/leads-server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const BATCH_STARTS = "12 November 2026";
const TARGET_EXAM = "MH-CET (MBA)";

const ALREADY_REGISTERED =
  "You already have an account with this email. Log in, or use Forgot password on the login page.";

// The enroll page lives on mbaprof.in, so the browser asks before posting here.
function corsHeaders(request: Request) {
  const origin = request.headers.get("origin")?.replace(/\/$/, "");
  const headers: Record<string, string> = { Vary: "Origin" };
  if (origin && allowedOrigins().includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Access-Control-Allow-Methods"] = "POST, OPTIONS";
    headers["Access-Control-Allow-Headers"] = "Content-Type";
    headers["Access-Control-Max-Age"] = "86400";
  }
  return headers;
}

export function OPTIONS(request: Request) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(request) });
}

function toLead(data: EnrollData): LeadData {
  return {
    name: data.name,
    phone: data.phone,
    email: data.email,
    city: data.city,
    currentStatus: data.status,
    plan: data.plan,
    consent: true,
  } as LeadData;
}

// Receives the form from the CET 2027 enroll page.
// CET Basic + FIRST200: creates the student account, places it in the batch
// chosen under Admin > Batches, and returns the login. CET Plus: saved as a
// lead for a counsellor to call (the account is made after payment).
export async function POST(request: Request) {
  const headers = corsHeaders(request);
  const reply = (body: object, status = 200) => NextResponse.json(body, { status, headers });

  // A browser on some other site: refuse before doing anything.
  const origin = request.headers.get("origin");
  if (origin && !headers["Access-Control-Allow-Origin"]) {
    return reply({ ok: false, error: "Not allowed" }, 403);
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  if (rateLimited(`enroll:${ip}`)) {
    return reply({ ok: false, error: "Too many attempts. Please wait a few minutes and try again." }, 429);
  }

  const body = await request.json().catch(() => null);
  const parsed = enrollSchema.safeParse(body);
  if (!parsed.success) {
    return reply({ ok: false, error: parsed.error.issues[0]?.message ?? "Please check the form." }, 400);
  }
  const data = parsed.data;
  const userAgent = request.headers.get("user-agent");

  if (data.code && !codeIsValid(data.code)) {
    return reply({ ok: false, error: `That code isn't valid. Check the spelling, or use ${ENROLL_CODE}.` }, 400);
  }

  try {
    if (data.plan === "PLUS") {
      const lead = await saveLead(toLead(data), userAgent, { code: data.code });
      if (lead.isNew) {
        after(async () => {
          await Promise.allSettled([sendNewLeadNotification(lead), sendLeadWebhook(lead)]);
        });
      }
      return reply({ ok: true, price: data.code ? "₹1,999" : "₹9,999" });
    }

    // CET Basic is free only with the code.
    if (!data.code) {
      return reply({ ok: false, error: `Enter the code ${ENROLL_CODE} to enroll in CET Basic for free.` }, 400);
    }

    if (await prisma.user.findUnique({ where: { email: data.email }, select: { id: true } })) {
      return reply({ ok: false, error: ALREADY_REGISTERED, loginUrl: `${siteUrl()}/login` }, 409);
    }

    const batch = await enrollBatch();
    const password = newPassword();
    const phone = normalizePhone(data.phone) as string;

    try {
      await prisma.user.create({
        data: {
          name: data.name,
          email: data.email,
          passwordHash: await bcrypt.hash(password, 10),
          role: "STUDENT",
          phone,
          targetExam: TARGET_EXAM,
          batchId: batch?.id ?? null,
        },
      });
    } catch (error) {
      // Two submits at once with the same email: the second loses the race.
      if ((error as { code?: string }).code === "P2002") {
        return reply({ ok: false, error: ALREADY_REGISTERED, loginUrl: `${siteUrl()}/login` }, 409);
      }
      throw error;
    }

    // Bookkeeping and emails happen after the reply so the student never waits.
    after(async () => {
      await Promise.allSettled([
        saveLead(toLead(data), userAgent, { code: data.code, stage: "ENROLLED" }),
        sendEnrollmentWelcomeEmail({
          name: data.name,
          email: data.email,
          password,
          batchName: batch?.name ?? null,
          batchStarts: BATCH_STARTS,
          loginUrl: `${siteUrl()}/login`,
        }),
        sendNewStudentNotification({
          name: data.name,
          email: data.email,
          phone,
          college: "-",
          course: "-",
          targetExam: `${TARGET_EXAM} · CET Basic via ${data.code} · batch: ${batch?.name ?? "not set"}`,
        }),
      ]);
    });

    return reply({ ok: true, loginId: data.email, password, batch: batch?.name ?? null });
  } catch (error) {
    console.error("Enrollment failed:", error);
    return reply(
      { ok: false, error: "We couldn't complete your enrollment. Please try again, or WhatsApp us on +91 82911 81713." },
      500
    );
  }
}
