import { randomInt } from "node:crypto";

import { prisma } from "@/lib/prisma";
import {
  CAMPAIGN_CET2027,
  formatPhone,
  normalizePhone,
  planLabel,
  type LeadData,
} from "@/lib/leads";

// Server-only: saving a lead and telling the team about it.

// No 0/O/1/I so a reference read out over the phone is never ambiguous.
const REF_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

function newRefCode() {
  let code = "";
  for (let i = 0; i < 5; i++) code += REF_ALPHABET[randomInt(REF_ALPHABET.length)];
  return `CET27-${code}`;
}

// ---- simple per-IP rate limit (one server process) ----------------------------------
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 6;
const hits = new Map<string, number[]>();

export function rateLimited(key: string, now = Date.now()) {
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(key, recent);
    return true;
  }
  recent.push(now);
  hits.set(key, recent);
  // Keep the map from growing forever.
  if (hits.size > 5000) {
    for (const [k, v] of hits) if (v.every((t) => now - t >= WINDOW_MS)) hits.delete(k);
  }
  return false;
}

export type SavedLead = {
  id: string;
  refCode: string;
  isNew: boolean;
  name: string;
  phone: string;
  email: string | null;
  city: string | null;
  currentStatus: string | null;
  plan: string;
  code: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  createdAt: Date;
};

// The same phone number registering again (a second ad click, a retry) updates
// the existing lead instead of creating a duplicate, and keeps its reference.
export async function saveLead(
  data: LeadData,
  userAgent: string | null,
  // From the enroll page: the code typed (if any) and, for a CET Basic
  // enrollment that created an account, stage ENROLLED.
  extra: { code?: string; stage?: string } = {}
): Promise<SavedLead> {
  const phone = normalizePhone(data.phone) as string;
  const since = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

  const existing = await prisma.lead.findFirst({
    where: { phone, campaign: CAMPAIGN_CET2027, createdAt: { gte: since } },
    orderBy: { createdAt: "desc" },
  });

  if (existing) {
    const updated = await prisma.lead.update({
      where: { id: existing.id },
      data: {
        name: data.name,
        email: data.email ?? existing.email,
        city: data.city ?? existing.city,
        currentStatus: data.currentStatus ?? existing.currentStatus,
        plan: data.plan,
        code: extra.code ?? existing.code,
        stage: extra.stage ?? existing.stage,
        consent: true,
        submissions: { increment: 1 },
      },
    });
    return { ...updated, isNew: false };
  }

  for (let attempt = 0; attempt < 6; attempt++) {
    try {
      const created = await prisma.lead.create({
        data: {
          refCode: newRefCode(),
          campaign: CAMPAIGN_CET2027,
          name: data.name,
          phone,
          email: data.email,
          city: data.city,
          currentStatus: data.currentStatus,
          plan: data.plan,
          code: extra.code,
          stage: extra.stage,
          consent: true,
          utmSource: data.utmSource,
          utmMedium: data.utmMedium,
          utmCampaign: data.utmCampaign,
          utmContent: data.utmContent,
          utmTerm: data.utmTerm,
          fbclid: data.fbclid,
          gclid: data.gclid,
          referrer: data.referrer,
          userAgent: userAgent?.slice(0, 300) ?? null,
        },
      });
      return { ...created, isNew: true };
    } catch (error) {
      // Reference collision (unique index): draw another and try again.
      if ((error as { code?: string }).code !== "P2002" || attempt === 5) throw error;
    }
  }
  throw new Error("Could not create a unique reference");
}

// ---- notifying the team ---------------------------------------------------------------

// Optional: POST every NEW lead as JSON to LEAD_WEBHOOK_URL (Zapier, Make, a CRM's
// inbound webhook ...). Never blocks or fails a sign-up.
export async function sendLeadWebhook(lead: SavedLead) {
  const url = process.env.LEAD_WEBHOOK_URL;
  // https only (plain http is accepted for localhost, so the hook can be tested locally).
  if (!url || !(/^https:\/\//i.test(url) || /^http:\/\/localhost(:\d+)?\//i.test(url))) return;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        event: "lead.created",
        campaign: CAMPAIGN_CET2027,
        reference: lead.refCode,
        name: lead.name,
        phone: formatPhone(lead.phone),
        email: lead.email,
        city: lead.city,
        current_status: lead.currentStatus,
        plan: planLabel(lead.plan),
        utm_source: lead.utmSource,
        utm_medium: lead.utmMedium,
        utm_campaign: lead.utmCampaign,
        created_at: lead.createdAt.toISOString(),
      }),
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) console.error("Lead webhook responded", res.status);
  } catch (error) {
    console.error("Lead webhook failed:", error);
  }
}
