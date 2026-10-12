import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-black/5 bg-brand-navy text-white/80">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <p className="text-lg font-semibold text-white">
              MBA<span className="text-brand-gold">Prof</span> Tests
            </p>
            <p className="mt-2 text-sm text-white/60">
              Focused MBA entrance exam mock tests with detailed percentile
              and section-wise analysis.
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold text-white">Explore</p>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link href="/tests" className="hover:text-brand-gold">
                  Tests
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold text-white">Account</p>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link href="/login" className="hover:text-brand-gold">
                  Log in
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-brand-gold">
                  Create an account
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold text-white">Contact</p>
            <p className="mt-3 text-sm text-white/60">
              <a href="mailto:info@mbaprof.in" className="hover:text-brand-gold">
                info@mbaprof.in
              </a>
            </p>
            <p className="mt-1 text-sm text-white/60">
              <a href="tel:+918433747631" className="hover:text-brand-gold">
                +91 84337 47631
              </a>
            </p>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-xs text-white/50">
          © {new Date().getFullYear()} MBAProf Tests. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
