import Image from "next/image";

// Shared layout for the sign-in family of pages (log in, create account, forgot and
// reset password): a photo and brand message on the left for large screens, the form on
// the right. Phones and tablets show just the form so it stays at the top.
export function AuthShell({
  headline,
  points,
  children,
}: {
  headline: React.ReactNode;
  points: string[];
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-[70vh] lg:min-h-[calc(100vh-4rem)] lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden bg-brand-navy lg:block">
        <Image
          src="/images/hero-student-bg.jpg"
          alt=""
          fill
          priority
          sizes="50vw"
          className="object-cover object-[78%_center]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-navy via-brand-navy/55 to-brand-navy/10" />
        <div className="absolute inset-x-0 bottom-0 p-10 xl:p-14">
          <p className="heading-flag mb-4 text-xs font-bold uppercase tracking-[0.14em] text-brand-gold-light">
            MBAProf Tests
          </p>
          <h2 className="max-w-md text-balance text-3xl font-extrabold leading-[1.15] text-white xl:text-4xl">
            {headline}
          </h2>
          <ul className="mt-6 max-w-md space-y-3">
            {points.map((point) => (
              <li key={point} className="flex items-start gap-3 text-[15px] leading-snug text-brand-grey-cool">
                <span
                  aria-hidden="true"
                  className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full bg-brand-gold"
                >
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#0b1d2e"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
                {point}
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <div className="flex items-center justify-center px-4 py-12 sm:px-6 sm:py-16 lg:px-12">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
