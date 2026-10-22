"use server";

import { getAdminSession } from "@/lib/admin";
import { isLeadStage } from "@/lib/leads";
import { prisma } from "@/lib/prisma";

// Moves one lead along the pipeline (New -> Contacted -> Enrolled / Not interested).
export async function setLeadStage(leadId: string, stage: string): Promise<{ ok: boolean }> {
  if (!(await getAdminSession())) return { ok: false };
  if (!isLeadStage(stage)) return { ok: false };
  try {
    await prisma.lead.update({ where: { id: leadId }, data: { stage } });
    return { ok: true };
  } catch (error) {
    console.error("Failed to update lead stage:", error);
    return { ok: false };
  }
}
