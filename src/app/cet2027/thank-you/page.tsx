import type { Metadata } from "next";
import Image from "next/image";

import { metaPixelId } from "@/lib/meta-pixel";

import { MetaPixel } from "../meta-pixel";

export const metadata: Metadata = {
  title: "Seat reserved | MBA Prof CET 2027",
  description: "Your CET 2027 seat is reserved. A counsellor will call within 24 hours.",
  robots: { index: false, follow: false },
  openGraph: {
    title: "Seat reserved | MBA Prof CET 2027",
    description: "Your CET 2027 seat is reserved. A counsellor will call within 24 hours.",
    type: "website",
  },
};

const heading = "font-[family-name:var(--font-jakarta)]";
const STEPS = [
  "You get a WhatsApp confirmation with your registration reference.",
  "A counsellor calls within 24 hours to fix your batch and answer your questions.",
  null, // step 3 has bold text, rendered below
];

export default async function Cet2027ThankYouPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string; plan?: string }>;
}) {
  const { ref, plan } = await searchParams;
  // Only ever echo back a reference that has the exact shape we generate.
  const reference = ref && /^CET27-[A-Z0-9]{5}$/.test(ref) ? ref : null;
  const choseBasicOrUnknown = plan !== "plus";
  const whatsappText = encodeURIComponent(
    reference
      ? `Hi, I registered for CET 2027. My reference is ${reference}.`
      : "Hi, I registered for CET 2027."
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] px-6 pb-14 pt-10">
      <MetaPixel pixelId={metaPixelId()} leadRef={reference ?? "unknown"} />

      <div className="mx-auto max-w-[720px]">
        <div className="mb-7">
          <Image
            src="/logo.png"
            alt="MBA Prof"
            width={1794}
            height={372}
            sizes="260px"
            priority
            className="h-[46px] w-auto sm:h-[54px]"
          />
        </div>

        <div className="rounded-[20px] border border-[#E2E8F0] bg-white p-6 shadow-[0_12px_32px_rgba(11,31,58,0.08)] sm:p-9">
          <div className="mb-[22px] flex h-[60px] w-[60px] items-center justify-center rounded-full bg-[#DCFCE7]">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#15803D" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          <h1 className={`${heading} mb-3 text-[30px] font-extrabold leading-[1.15] tracking-[-0.7px] text-[#0B1F3A] sm:text-[36px]`}>
            Your seat is reserved.
          </h1>
          <p className="mb-5 max-w-[520px] text-base leading-[1.6] text-[#475569] sm:text-[17px]">
            We have your details. A counsellor from our Navi Mumbai team will call you within 24 hours to confirm your batch and walk you through the CET 2027 plan.
          </p>

          {reference && (
            <p className="mb-7 inline-flex items-center gap-2 rounded-[10px] border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-2.5 text-sm text-[#475569]">
              Your reference
              <strong className="text-[15px] font-bold tracking-[0.5px] text-[#0B1F3A]">{reference}</strong>
            </p>
          )}

          <div className="mb-7 rounded-[14px] border border-[#E2E8F0] bg-[#F8FAFC] p-[22px]">
            <h2 className="mb-4 text-[15px] font-bold tracking-[0.2px] text-[#0B1F3A]">What happens next</h2>
            {STEPS.map((text, i) => (
              <div key={i} className={`flex gap-[13px] ${i < STEPS.length - 1 ? "mb-3.5" : ""}`}>
                <div className="flex h-[26px] w-[26px] flex-none items-center justify-center rounded-full bg-[#C2410C] text-[13px] font-bold text-white">
                  {i + 1}
                </div>
                <p className="pt-[3px] text-[15px] leading-[1.55] text-[#334155]">
                  {text ?? (
                    <>
                      You receive your login, study material and class schedule before the batch begins on{" "}
                      <strong className="font-bold text-[#0B1F3A]">14 November 2026</strong>.
                    </>
                  )}
                </p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href={`https://wa.me/918433747631?text=${whatsappText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-xl bg-[#15803D] px-6 text-[15.5px] font-bold text-white no-underline hover:bg-[#166534]"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
              Message us on WhatsApp
            </a>
            <a
              href="tel:+918433747631"
              className="inline-flex min-h-[52px] items-center justify-center rounded-xl border-[1.5px] border-[#CBD5E1] bg-white px-6 text-[15.5px] font-bold text-[#0B1F3A] no-underline hover:bg-[#F8FAFC]"
            >
              Call +91 84337 47631
            </a>
          </div>
        </div>

        {/* Upgrade nudge: only for people who picked (or defaulted to) CET Basic */}
        {choseBasicOrUnknown && (
          <div className="mt-5 flex flex-wrap items-center gap-6 rounded-[20px] bg-[#0B1F3A] p-6 sm:p-8">
            <div className="min-w-0 flex-[1_1_320px]">
              <div className="mb-3.5 inline-flex rounded-full bg-[#C2410C] px-2.5 py-[5px] text-[11px] font-bold tracking-[0.6px] text-white">
                WHILE SEATS LAST
              </div>
              <h2 className={`${heading} mb-2.5 text-[22px] font-extrabold leading-[1.2] text-white sm:text-2xl`}>
                Add 30 mocks and 10 masterclasses for ₹2,999
              </h2>
              <p className="text-[15px] leading-[1.6] text-[#CBD5E1]">
                CET Plus adds 15 more mock CETs, 15 mocks for MAT, ATMA and CMAT, and 10 CET masterclasses by alumni of JBIMS and other top B-schools — ₹2,999 incl. GST instead of ₹12,999. Mention it on your counselling call, or upgrade now.
              </p>
            </div>
            <a
              href="/cet2027#pricing"
              className="inline-flex min-h-[52px] flex-none items-center justify-center rounded-xl bg-white px-[26px] text-[15.5px] font-bold text-[#0B1F3A] no-underline hover:bg-[#F1F5F9]"
            >
              See CET Plus
            </a>
          </div>
        )}

        <p className="mt-6 text-center text-[13px] leading-[1.6] text-[#64748B]">
          Didn&apos;t mean to register, or need to change a detail? Email{" "}
          <a href="mailto:info@mbaprof.in" className="text-[#0B4F8A] hover:text-[#073659]">
            info@mbaprof.in
          </a>
        </p>
      </div>
    </div>
  );
}
