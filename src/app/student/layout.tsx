import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { Logo } from "@/components/logo";
import { signOutAction } from "@/lib/actions";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="min-h-screen bg-brand-cream">
      <header className="border-b border-black/5 bg-white">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Logo />
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-brand-ink/60 sm:inline">
              {session.user.name}
            </span>
            <Link
              href="/student/profile"
              className="text-sm font-medium text-brand-navy hover:text-brand-gold"
            >
              Edit profile
            </Link>
            <form action={signOutAction}>
              <button
                type="submit"
                className="cursor-pointer text-sm font-medium text-brand-navy hover:text-brand-gold"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">{children}</main>
    </div>
  );
}
