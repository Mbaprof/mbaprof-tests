import type { Metadata } from "next";

import { requireAdmin, istDate } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

import { AddAdmin, RemoveAdminButton } from "./admin-manager";

export const metadata: Metadata = { title: "Admins | MBAProf Tests" };

export default async function AdminsPage() {
  const session = await requireAdmin();
  const admins = await prisma.user.findMany({
    where: { role: "ADMIN" },
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, email: true, createdAt: true },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-navy">Admins</h1>
      <p className="mt-1 text-sm text-brand-ink/60">
        People who can manage students, tests, batches and leads. Admins don&apos;t appear in the Students list.
      </p>

      <div className="mt-6">
        <AddAdmin />
      </div>

      <section className="mt-8">
        <h2 className="text-lg font-bold text-brand-navy">Current admins ({admins.length})</h2>
        <ul className="mt-3 space-y-3">
          {admins.map((admin) => {
            const isYou = admin.id === session.user.id;
            return (
              <li
                key={admin.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-black/5 bg-white p-4"
              >
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2 font-semibold text-brand-navy">
                    {admin.name}
                    {isYou && (
                      <span className="rounded-full bg-brand-gold/20 px-2.5 py-0.5 text-xs font-semibold text-brand-navy">
                        You
                      </span>
                    )}
                  </p>
                  <p className="mt-0.5 break-all text-sm text-brand-ink/70">{admin.email}</p>
                  <p className="mt-0.5 text-xs text-brand-ink/50">Account created {istDate.format(admin.createdAt)}</p>
                </div>
                {isYou ? (
                  <p className="text-xs text-brand-ink/50">You can&apos;t remove your own access.</p>
                ) : (
                  <RemoveAdminButton userId={admin.id} name={admin.name} />
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
