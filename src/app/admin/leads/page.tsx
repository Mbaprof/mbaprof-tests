import type { Metadata } from "next";
import Link from "next/link";

import { WhatsAppButton } from "@/components/whatsapp-button";
import { istDate, istDateTime } from "@/lib/admin";
import {
  LEADS_PAGE_SIZE,
  leadWhere,
  parseLeadFilters,
} from "@/lib/admin-leads";
import { formatPhone, LEAD_STAGES, planLabel } from "@/lib/leads";
import { prisma } from "@/lib/prisma";

import { StageSelect } from "./stage-select";

export const metadata: Metadata = { title: "Leads | MBAProf Tests" };

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filters = parseLeadFilters(await searchParams);
  const where = leadWhere(filters);

  const [total, stageGroups, allCount] = await Promise.all([
    prisma.lead.count({ where }),
    // Stage counts respect the search and program filters, not the stage tab.
    prisma.lead.groupBy({
      by: ["stage"],
      where: leadWhere({ ...filters, stage: "" }),
      _count: { _all: true },
    }),
    prisma.lead.count({ where: leadWhere({ ...filters, stage: "" }) }),
  ]);
  const stageCounts = new Map(stageGroups.map((g) => [g.stage, g._count._all]));

  const pageCount = Math.max(1, Math.ceil(total / LEADS_PAGE_SIZE));
  const page = Math.min(filters.page, pageCount);
  const leads = await prisma.lead.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * LEADS_PAGE_SIZE,
    take: LEADS_PAGE_SIZE,
  });

  const qs = (overrides: Record<string, string | number | undefined>) => {
    const p = new URLSearchParams();
    const merged: Record<string, string | number | undefined> = {
      q: filters.q,
      stage: filters.stage,
      plan: filters.plan,
      ...overrides,
    };
    for (const [k, v] of Object.entries(merged)) {
      const text = v === undefined ? "" : String(v);
      if (text !== "" && !(k === "page" && text === "1")) p.set(k, text);
    }
    const s = p.toString();
    return s ? `?${s}` : "";
  };

  const from = total === 0 ? 0 : (page - 1) * LEADS_PAGE_SIZE + 1;
  const to = Math.min(page * LEADS_PAGE_SIZE, total);
  const filtered = Boolean(filters.q || filters.stage || filters.plan);

  const tabClass = (active: boolean) =>
    `whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
      active ? "bg-brand-navy text-white" : "bg-white text-brand-ink/70 hover:bg-brand-navy/10"
    }`;

  const source = (l: (typeof leads)[number]) =>
    [l.utmSource, l.utmCampaign].filter(Boolean).join(" / ") || (l.referrer ? "Referral" : "Direct");

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">Leads</h1>
          <p className="mt-1 text-sm text-brand-ink/60">
            People who registered on the CET 2027 page (
            <a href="/cet2027" target="_blank" rel="noopener noreferrer" className="font-medium text-brand-navy hover:underline">
              tests.mbaprof.in/cet2027
            </a>
            ), newest first.
          </p>
        </div>
        <a
          href={`/admin/leads/export${qs({ page: undefined })}`}
          className="whitespace-nowrap rounded-md bg-brand-navy px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-navy-light"
        >
          Download CSV
        </a>
      </div>

      <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
        <Link href={`/admin/leads${qs({ stage: undefined, page: undefined })}`} className={tabClass(!filters.stage)}>
          All ({allCount})
        </Link>
        {LEAD_STAGES.map((s) => (
          <Link
            key={s.value}
            href={`/admin/leads${qs({ stage: s.value, page: undefined })}`}
            className={tabClass(filters.stage === s.value)}
          >
            {s.label} ({stageCounts.get(s.value) ?? 0})
          </Link>
        ))}
      </div>

      <form method="get" className="mt-4 flex flex-wrap items-end gap-3 rounded-xl border border-black/5 bg-white p-4">
        {filters.stage && <input type="hidden" name="stage" value={filters.stage} />}
        <div className="w-full flex-1 sm:min-w-[14rem]">
          <label htmlFor="q" className="block text-xs font-medium text-brand-ink/70">
            Search
          </label>
          <input
            id="q"
            name="q"
            defaultValue={filters.q}
            placeholder="Name, phone, email, city, reference or campaign"
            className="mt-1 w-full rounded-md border border-black/10 bg-white px-3 py-2 text-sm focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy"
          />
        </div>
        <div className="w-full sm:w-auto">
          <label htmlFor="plan" className="block text-xs font-medium text-brand-ink/70">
            Program
          </label>
          <select
            id="plan"
            name="plan"
            defaultValue={filters.plan}
            className="mt-1 w-full rounded-md border border-black/10 bg-white px-3 py-2 text-sm focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy sm:w-44"
          >
            <option value="">All programs</option>
            <option value="BASIC">CET Basic</option>
            <option value="PLUS">CET Plus</option>
          </select>
        </div>
        <button
          type="submit"
          className="cursor-pointer rounded-md border border-brand-navy/20 px-4 py-2 text-sm font-semibold text-brand-navy transition-colors hover:bg-brand-navy hover:text-white"
        >
          Apply
        </button>
        {filtered && (
          <Link href="/admin/leads" className="py-2 text-sm font-medium text-brand-ink/60 hover:text-brand-navy hover:underline">
            Clear
          </Link>
        )}
      </form>

      {leads.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-brand-navy/20 bg-white p-10 text-center text-brand-ink/60">
          {filtered ? "No leads match these filters." : "No one has registered on the CET 2027 page yet."}
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-xl border border-black/5 bg-white">
          {/* Phones: one card per lead */}
          <ul className="divide-y divide-black/5 md:hidden">
            {leads.map((l) => (
              <li key={l.id} className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-brand-ink">{l.name}</p>
                    <p className="text-xs text-brand-ink/60">
                      {l.refCode} · {istDateTime.format(l.createdAt)}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      l.plan === "PLUS" ? "bg-brand-gold/20 text-brand-navy" : "bg-black/5 text-brand-ink/70"
                    }`}
                  >
                    {planLabel(l.plan)}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <a href={`tel:+91${l.phone}`} className="inline-flex min-h-9 items-center text-sm font-medium text-brand-navy">
                    {formatPhone(l.phone)}
                  </a>
                  <WhatsAppButton phone={l.phone} name={l.name} large />
                </div>
                <p className="text-sm text-brand-ink/80">
                  {[l.city, l.currentStatus].filter(Boolean).join(" · ") || "-"}
                </p>
                {l.email && (
                  <a href={`mailto:${l.email}`} className="block break-all text-xs text-brand-ink/60">
                    {l.email}
                  </a>
                )}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs text-brand-ink/50">Source: {source(l)}</span>
                  <StageSelect leadId={l.id} stage={l.stage} />
                </div>
              </li>
            ))}
          </ul>

          {/* Tablets and up: table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[60rem] text-left text-sm">
              <thead className="border-b border-black/5 bg-brand-cream/60 text-xs uppercase tracking-wide text-brand-ink/60">
                <tr>
                  <th className="px-4 py-3 font-semibold">Lead</th>
                  <th className="px-4 py-3 font-semibold">Phone</th>
                  <th className="px-4 py-3 font-semibold">City / status</th>
                  <th className="px-4 py-3 font-semibold">Program</th>
                  <th className="px-4 py-3 font-semibold">Source</th>
                  <th className="px-4 py-3 font-semibold">Registered</th>
                  <th className="px-4 py-3 font-semibold">Stage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {leads.map((l) => (
                  <tr key={l.id} className="align-top">
                    <td className="px-4 py-3">
                      <p className="font-medium text-brand-ink">{l.name}</p>
                      <p className="text-xs text-brand-ink/50">{l.refCode}</p>
                      {l.email && (
                        <a href={`mailto:${l.email}`} className="text-xs text-brand-ink/60 hover:text-brand-navy hover:underline">
                          {l.email}
                        </a>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="flex items-center gap-2">
                        <a href={`tel:+91${l.phone}`} className="text-brand-ink hover:text-brand-navy hover:underline">
                          {formatPhone(l.phone)}
                        </a>
                        <WhatsAppButton phone={l.phone} name={l.name} />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-brand-ink">{l.city ?? "-"}</p>
                      <p className="text-xs text-brand-ink/60">{l.currentStatus ?? "-"}</p>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          l.plan === "PLUS" ? "bg-brand-gold/20 text-brand-navy" : "bg-black/5 text-brand-ink/70"
                        }`}
                      >
                        {planLabel(l.plan)}
                      </span>
                      {l.submissions > 1 && (
                        <p className="mt-1 text-xs text-brand-ink/50">Submitted {l.submissions}×</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-brand-ink/70">{source(l)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-brand-ink/80" title={istDateTime.format(l.createdAt)}>
                      {istDate.format(l.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <StageSelect leadId={l.id} stage={l.stage} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-black/5 px-4 py-3 text-sm">
            <p className="text-brand-ink/60">
              Showing {from}-{to} of {total.toLocaleString("en-IN")}
            </p>
            <div className="flex items-center gap-2">
              {page > 1 ? (
                <Link href={`/admin/leads${qs({ page: page - 1 })}`} className="rounded-md border border-black/10 px-3 py-1.5 font-medium text-brand-navy hover:bg-brand-cream">
                  Previous
                </Link>
              ) : (
                <span className="rounded-md border border-black/5 px-3 py-1.5 text-brand-ink/30">Previous</span>
              )}
              <span className="text-brand-ink/60">
                Page {page} of {pageCount}
              </span>
              {page < pageCount ? (
                <Link href={`/admin/leads${qs({ page: page + 1 })}`} className="rounded-md border border-black/10 px-3 py-1.5 font-medium text-brand-navy hover:bg-brand-cream">
                  Next
                </Link>
              ) : (
                <span className="rounded-md border border-black/5 px-3 py-1.5 text-brand-ink/30">Next</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
