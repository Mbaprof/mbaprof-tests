"use client";

import Link from "next/link";
import { useState } from "react";

import { Logo } from "@/components/logo";
import { signOutAction } from "@/lib/actions";

const navLinks = [{ href: "/tests", label: "Tests" }];

const navLinkClass =
  "relative whitespace-nowrap text-sm font-medium text-brand-ink/80 transition-colors hover:text-brand-navy after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:bg-brand-gold after:transition-all after:duration-200 hover:after:w-full";

type SessionInfo = {
  name: string;
  role: string;
} | null;

export function SiteHeaderClient({ session }: { session: SessionInfo }) {
  const [open, setOpen] = useState(false);
  const dashboardHref = "/student";

  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
        <Logo />

        <nav className="hidden items-center gap-6 lg:flex">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className={navLinkClass}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-4 lg:flex">
          {session ? (
            <div className="group relative">
              <button
                type="button"
                className="flex items-center gap-1.5 rounded-full py-1.5 pl-1.5 pr-3 text-brand-navy transition-colors hover:bg-brand-cream"
                aria-label="Account menu"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-navy text-xs font-semibold text-white">
                  {session.name.charAt(0).toUpperCase()}
                </span>
                <span className="max-w-[140px] truncate text-sm font-medium">
                  {session.name}
                </span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3.5 w-3.5 shrink-0 transition-transform duration-150 group-hover:rotate-180"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
                </svg>
              </button>
              <div className="invisible absolute right-0 top-full z-50 w-44 pt-3 opacity-0 transition-opacity duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                <div className="overflow-hidden rounded-xl bg-brand-navy py-2 shadow-lg">
                  <Link
                    href={dashboardHref}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-white/90 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.75 3.75h6v6h-6v-6ZM14.25 3.75h6v6h-6v-6ZM3.75 14.25h6v6h-6v-6ZM14.25 14.25h6v6h-6v-6Z"
                      />
                    </svg>
                    Dashboard
                  </Link>
                  {session.role === "ADMIN" && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-white/90 transition-colors hover:bg-white/10 hover:text-white"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 3l7.5 3v5.25c0 4.5-3.2 8.2-7.5 9.75-4.3-1.55-7.5-5.25-7.5-9.75V6L12 3Z"
                        />
                      </svg>
                      Admin panel
                    </Link>
                  )}
                  {session.role !== "ADMIN" && (
                    <Link
                      href="/student/profile"
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-white/90 transition-colors hover:bg-white/10 hover:text-white"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.5 20.25a7.5 7.5 0 0 1 15 0"
                        />
                      </svg>
                      Edit profile
                    </Link>
                  )}
                  <form action={signOutAction}>
                    <button
                      type="submit"
                      className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm font-medium text-white/90 transition-colors hover:bg-white/10 hover:text-white"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M21 12H9M18 15l3-3-3-3"
                        />
                      </svg>
                      Sign out
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ) : (
            <div className="group relative">
              <button
                type="button"
                className="flex items-center gap-1 rounded-full p-2 text-brand-navy transition-colors hover:bg-brand-cream"
                aria-label="Account menu"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.75}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.5 20.25a7.5 7.5 0 0 1 15 0"
                  />
                </svg>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3.5 w-3.5 transition-transform duration-150 group-hover:rotate-180"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
                </svg>
              </button>
              <div className="invisible absolute right-0 top-full z-50 w-44 pt-3 opacity-0 transition-opacity duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                <div className="overflow-hidden rounded-xl bg-brand-navy py-2 shadow-lg">
                  <Link
                    href="/login"
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-white/90 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15M12 9l3 3-3 3M3.75 12h11.25"
                      />
                    </svg>
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-white/90 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 19.5a3 3 0 0 0-3-3h-3a3 3 0 0 0-3 3M13.5 9a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM19 8v6M22 11h-6"
                      />
                    </svg>
                    Register
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex h-9 w-9 items-center justify-center rounded-md text-brand-navy lg:hidden"
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            {open ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <div className="border-t border-black/5 bg-white px-4 py-4 lg:hidden">
          <nav className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-brand-ink/80 hover:text-brand-navy"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-4 flex flex-col gap-3 border-t border-black/5 pt-4">
            {session ? (
              <>
                <p className="text-sm text-brand-ink/60">
                  Signed in as{" "}
                  <span className="font-semibold text-brand-navy">{session.name}</span>
                </p>
                <Link
                  href={dashboardHref}
                  className="rounded-md bg-brand-navy px-4 py-2 text-center text-sm font-semibold text-white"
                >
                  Dashboard
                </Link>
                {session.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    className="text-sm font-medium text-brand-navy"
                  >
                    Admin panel
                  </Link>
                )}
                {session.role !== "ADMIN" && (
                  <Link
                    href="/student/profile"
                    className="text-sm font-medium text-brand-navy"
                  >
                    Edit profile
                  </Link>
                )}
                <form action={signOutAction}>
                  <button
                    type="submit"
                    className="cursor-pointer text-sm font-medium text-brand-navy"
                  >
                    Sign out
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium text-brand-navy">
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="rounded-md bg-brand-gold px-4 py-2 text-center text-sm font-semibold text-brand-navy"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
