import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { Logo } from "@/components/logo";
import { signOutAction } from "@/lib/actions";

const linkClass = "text-sm font-medium text-brand-navy hover:text-brand-gold";
const pillClass =
  "whitespace-nowrap rounded-full bg-brand-cream px-4 py-2 text-sm font-medium text-brand-navy transition-colors hover:bg-brand-navy/10";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const isAdmin = session.user.role === "ADMIN";

  return (
    <div className="min-h-screen bg-brand-cream">
      <header className="border-b border-black/5 bg-white">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Logo />
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-brand-ink/60 md:inline">
              {session.user.name}
            </span>
            {/* Links sit in the header from tablet width up; on phones they move to the row below. */}
            <div className="hidden items-center gap-4 sm:flex">
              {isAdmin && (
                <Link href="/admin" className={linkClass}>
                  Admin panel
                </Link>
              )}
              <Link href="/student/lectures" className={linkClass}>
                Live classes
              </Link>
              <Link href="/student/profile" className={linkClass}>
                Edit profile
              </Link>
            </div>
            <form action={signOutAction}>
              <button type="submit" className={`${linkClass} cursor-pointer`}>
                Sign out
              </button>
            </form>
          </div>
        </div>
        <nav aria-label="Student sections" className="border-t border-black/5 sm:hidden">
          <div className="mx-auto flex max-w-5xl gap-2 overflow-x-auto px-4 py-2">
            <Link href="/student" className={pillClass}>
              Tests
            </Link>
            <Link href="/student/lectures" className={pillClass}>
              Live classes
            </Link>
            <Link href="/student/profile" className={pillClass}>
              Edit profile
            </Link>
            {isAdmin && (
              <Link href="/admin" className={pillClass}>
                Admin panel
              </Link>
            )}
          </div>
        </nav>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">{children}</main>
    </div>
  );
}
