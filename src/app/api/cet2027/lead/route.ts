import { after, NextResponse } from "next/server";

import { sendNewLeadNotification } from "@/lib/email";
import { leadSchema } from "@/lib/leads";
import { rateLimited, saveLead, sendLeadWebhook } from "@/lib/leads-server";

export const dynamic = "force-dynamic";

// Receives the sign-up from the /cet2027 form. Public, so it defends itself:
// a hidden honeypot field, a per-IP limit, strict validation, and all
// notification work happens after the response so the visitor never waits.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  // Bots fill every field. Pretend it worked so they do not retry.
  if (typeof (body as { website?: unknown }).website === "string" && (body as { website: string }).website.trim() !== "") {
    return NextResponse.json({ ok: true, ref: "CET27-XXXXX" });
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json(
      { ok: false, error: "Too many attempts. Please wait a few minutes and try again." },
      { status: 429 }
    );
  }

  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!fields[key]) fields[key] = issue.message;
    }
    return NextResponse.json(
      { ok: false, error: Object.values(fields)[0] ?? "Please check the form", fields },
      { status: 400 }
    );
  }

  try {
    const lead = await saveLead(parsed.data, request.headers.get("user-agent"));
    if (lead.isNew) {
      after(async () => {
        await Promise.allSettled([sendNewLeadNotification(lead), sendLeadWebhook(lead)]);
      });
    }
    return NextResponse.json({ ok: true, ref: lead.refCode });
  } catch (error) {
    console.error("Failed to save lead:", error);
    return NextResponse.json(
      { ok: false, error: "We couldn't save your details. Please try again, or call us." },
      { status: 500 }
    );
  }
}
