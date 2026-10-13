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
    "text-sm font-medium text-brand-navy transition-colors hover:text-brand-gold";

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
            <Link href="/admin" className={navClass}>
              Overview
            </Link>
            <Link href="/admin/students" className={navClass}>
              Students
            </Link>
            <Link href="/student" className={`${navClass} hidden sm:inline`}>
              Take tests
            </Link>
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
      </header>
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">{children}</main>
    </div>
  );
}
