import Link from "next/link";

import { Logo } from "@/components/logo";
import { requireAdmin } from "@/lib/admin";
import { signOutAction } from "@/lib/actions";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();

  const navClass =
    "text-sm font-medium text-brand-navy transition-colors hover:text-brand-gold-dark";

  return (
    <div className="min-h-screen bg-brand-cream">
      <header className="border-b border-black/5 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <Logo />
            <span className="hidden rounded-full bg-brand-navy px-2.5 py-0.5 text-xs font-semibold text-white sm:inline">
              Admin
            </span>
          </div>
          <nav className="flex items-center gap-4 sm:gap-5">
            <div className="hidden items-center gap-5 sm:flex">
              <Link href="/admin" className={navClass}>
                Overview
              </Link>
              <Link href="/admin/students" className={navClass}>
                Students
              </Link>
              <Link href="/admin/tests" className={navClass}>
                Tests
              </Link>
              <Link href="/admin/batches" className={navClass}>
                Batches
              </Link>
              <Link href="/admin/leads" className={navClass}>
                Leads
              </Link>
              <Link href="/student" className={navClass}>
                Take tests
              </Link>
            </div>
            <span className="hidden text-sm text-brand-ink/60 md:inline">
              {session.user.name}
            </span>
            <form action={signOutAction}>
              <button type="submit" className={`${navClass} cursor-pointer`}>
                Sign out
              </button>
            </form>
          </nav>
        </div>
        <nav
          aria-label="Admin sections"
          className="border-t border-black/5 sm:hidden"
        >
          <div className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 py-2">
            <Link href="/admin" className="whitespace-nowrap rounded-full bg-brand-cream px-4 py-2 text-sm font-medium text-brand-navy transition-colors hover:bg-brand-navy/10">
              Overview
            </Link>
            <Link href="/admin/students" className="whitespace-nowrap rounded-full bg-brand-cream px-4 py-2 text-sm font-medium text-brand-navy transition-colors hover:bg-brand-navy/10">
              Students
            </Link>
            <Link href="/admin/tests" className="whitespace-nowrap rounded-full bg-brand-cream px-4 py-2 text-sm font-medium text-brand-navy transition-colors hover:bg-brand-navy/10">
              Tests
            </Link>
            <Link href="/admin/batches" className="whitespace-nowrap rounded-full bg-brand-cream px-4 py-2 text-sm font-medium text-brand-navy transition-colors hover:bg-brand-navy/10">
              Batches
            </Link>
            <Link href="/admin/leads" className="whitespace-nowrap rounded-full bg-brand-cream px-4 py-2 text-sm font-medium text-brand-navy transition-colors hover:bg-brand-navy/10">
              Leads
            </Link>
            <Link href="/student" className="whitespace-nowrap rounded-full bg-brand-cream px-4 py-2 text-sm font-medium text-brand-navy transition-colors hover:bg-brand-navy/10">
              Take tests
            </Link>
          </div>
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">{children}</main>
    </div>
  );
}
