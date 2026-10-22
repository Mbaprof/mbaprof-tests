import { getAdminSession } from "@/lib/admin";
import { leadWhere, parseLeadFilters } from "@/lib/admin-leads";
import { formatPhone, planLabel, stageLabel } from "@/lib/leads";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Spreadsheet apps run cells starting with = + - @ as formulas, so those get a
// leading quote before the normal CSV quoting.
function cell(value: string | number | null | undefined) {
  let s = value === null || value === undefined ? "" : String(value);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

const ist = (d: Date) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    dateStyle: "short",
    timeStyle: "short",
    hour12: false,
  })
    .format(d)
    .replace(",", "");

export async function GET(request: Request) {
  if (!(await getAdminSession())) return new Response("Forbidden", { status: 403 });

  const filters = parseLeadFilters(Object.fromEntries(new URL(request.url).searchParams));
  const leads = await prisma.lead.findMany({
    where: leadWhere(filters),
    orderBy: { createdAt: "desc" },
    take: 20000,
  });

  const header = [
    "Reference",
    "Name",
    "Phone",
    "Email",
    "City",
    "Current status",
    "Program",
    "Stage",
    "Source",
    "Medium",
    "Campaign",
    "Content",
    "Term",
    "Times submitted",
    "Registered (IST)",
  ];
  const lines = [header.map(cell).join(",")];
  for (const l of leads) {
    lines.push(
      [
        l.refCode,
        l.name,
        // No leading + : spreadsheets would treat it as a formula (and our safety quote would show).
        formatPhone(l.phone).replace(/^\+/, ""),
        l.email,
        l.city,
        l.currentStatus,
        planLabel(l.plan),
        stageLabel(l.stage),
        l.utmSource,
        l.utmMedium,
        l.utmCampaign,
        l.utmContent,
        l.utmTerm,
        l.submissions,
        ist(l.createdAt),
      ]
        .map(cell)
        .join(",")
    );
  }

  const day = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
  return new Response("﻿" + lines.join("\r\n") + "\r\n", {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="cet2027-leads-${day}.csv"`,
      "cache-control": "no-store",
    },
  });
}
