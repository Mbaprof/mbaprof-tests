import type { Prisma } from "@prisma/client";

import { isLeadStage } from "@/lib/leads";

export const LEADS_PAGE_SIZE = 25;

export type LeadFilters = {
  q: string;
  stage: string; // "" = all, else NEW | CONTACTED | ENROLLED | NOT_INTERESTED
  plan: string; // "" = all, BASIC | PLUS
  page: number;
};

type Params = Record<string, string | string[] | undefined>;
const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

export function parseLeadFilters(params: Params): LeadFilters {
  const q = first(params.q).trim().slice(0, 100);
  const stageRaw = first(params.stage);
  const stage = isLeadStage(stageRaw) ? stageRaw : "";
  const planRaw = first(params.plan);
  const plan = planRaw === "BASIC" || planRaw === "PLUS" ? planRaw : "";
  const page = Math.max(1, Math.floor(Number(first(params.page))) || 1);
  return { q, stage, plan, page };
}

export function leadWhere({ q, stage, plan }: LeadFilters): Prisma.LeadWhereInput {
  const where: Prisma.LeadWhereInput = {};
  if (stage) where.stage = stage;
  if (plan) where.plan = plan;
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { phone: { contains: q.replace(/\D/g, "") || q } },
      { email: { contains: q, mode: "insensitive" } },
      { city: { contains: q, mode: "insensitive" } },
      { refCode: { contains: q, mode: "insensitive" } },
      { utmCampaign: { contains: q, mode: "insensitive" } },
      { utmSource: { contains: q, mode: "insensitive" } },
    ];
  }
  return where;
}
