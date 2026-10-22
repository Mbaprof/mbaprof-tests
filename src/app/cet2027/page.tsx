import type { Metadata } from "next";
import Image from "next/image";

import { metaPixelId } from "@/lib/meta-pixel";

import { LeadForm } from "./lead-form";
import { MetaPixel } from "./meta-pixel";

const DESCRIPTION =
  "MH-CET (MBA/MMS) 2027 preparation: 120+ hours of live online classes, every class recorded, mock CETs with feedback and full admission guidance. CET Basic free for the first 200 students. Batch starts 14 November 2026.";

export const metadata: Metadata = {
  title: "CET 2027 Coaching & Admission Guidance | MBA Prof",
  description: DESCRIPTION,
  openGraph: {
    title: "CET 2027 Coaching & Admission Guidance | MBA Prof",
    description: DESCRIPTION,
    type: "website",
    url: "/cet2027",
  },
  alternates: { canonical: "/cet2027" },
};

const heading = "font-[family-name:var(--font-jakarta)]";
const wrap = "mx-auto max-w-[1160px]";
const PHONE = "+91 84337 47631";
const TEL = "tel:+918433747631";

// ---- small building blocks ------------------------------------------------------------

function Check({ size = 18, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="#15803D"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`flex-none ${className}`}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function Icon({ children, size = 22, stroke = "#0B4F8A" }: { children: React.ReactNode; size?: number; stroke?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={stroke}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

const eyebrow = "mb-2.5 text-xs font-bold tracking-[1.4px] text-[#C2410C]";
const h2 = `${heading} font-extrabold tracking-[-0.5px] text-[#0B1F3A]`;

// ---- content --------------------------------------------------------------------------------

const HERO_CHIPS = ["120+ live hours", "Recorded access", "Mocks with analysis", "Admission guidance", "10 years of CET papers"];

const COLLEGES = ["JBIMS", "SIMSREE", "ASBS MMS", "PUMBA", "Welingkar", "OIM", "Chetana"];

const FEATURES = [
  {
    title: "120+ hours of live online classes",
    body: "Full classroom-style coverage of Quant, LR, DI, Verbal and Abstract Reasoning, delivered live online.",
    icon: (
      <Icon>
        <polygon points="23 7 16 12 23 17 23 7" />
        <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
      </Icon>
    ),
  },
  {
    title: "Every class in recorded format",
    body: "Miss a class or want a second pass before the exam? Every session is recorded and stays available to you.",
    icon: (
      <Icon>
        <circle cx="12" cy="12" r="10" />
        <polygon points="10 8 16 12 10 16 10 8" />
      </Icon>
    ),
  },
  {
    title: "5 mock CETs with feedback",
    body: "Every mock comes back with a detailed analysis and personal feedback on what to fix before the next one.",
    icon: (
      <Icon>
        <path d="M3 3v18h18" />
        <polyline points="19 9 13 15 9 11 5 15" />
      </Icon>
    ),
  },
  {
    title: "Notification alerts",
    body: "Registration windows, form deadlines, admit cards and CAP round dates, pushed to you before you miss them.",
    icon: (
      <Icon>
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </Icon>
    ),
  },
  {
    title: "Application guidance",
    body: "Help with the CET application itself, plus institute shortlisting built around your score range and goals.",
    icon: (
      <Icon>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="9" y1="15" x2="15" y2="15" />
      </Icon>
    ),
  },
  {
    title: "Interview prep & strategy",
    body: "Personal interview tips and strategy sessions so you walk into the panel with a prepared story, not a guess.",
    icon: (
      <Icon>
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </Icon>
    ),
  },
];

const BASIC_LIST = [
  "120+ classroom hours of online training",
  "Material designed from 10 years of actual CET papers",
  "Access to recorded videos",
  "5 mock tests with feedback and analysis",
  "Notification alerts for every deadline",
  "Application guidance",
  "Institute shortlisting and application support",
  "Interview preparation tips and strategy sessions",
];

const PLUS_LIST: { bold?: string; text: string }[] = [
  { bold: "15 additional mock CETs", text: " — 20 CET mocks in total" },
  { bold: "15 mocks for MAT, ATMA and CMAT", text: "" },
  { bold: "10 CET masterclasses", text: " by alumni of JBIMS and other top B-schools" },
  { text: "Practice across every exam pattern, not just CET" },
  { text: "A second shot at a good college if CET day goes badly" },
];

type Cell = { kind: "included" | "none" | "number" | "strike" | "price"; text?: string };
const COMPARE: { label: string; basic: Cell; plus: Cell }[] = [
  { label: "120+ hours of live online training", basic: { kind: "included" }, plus: { kind: "included" } },
  { label: "Material designed from 10 years of actual CET papers", basic: { kind: "included" }, plus: { kind: "included" } },
  { label: "Recorded video access", basic: { kind: "included" }, plus: { kind: "included" } },
  { label: "Mock CETs with feedback and analysis", basic: { kind: "number", text: "5" }, plus: { kind: "number", text: "20" } },
  { label: "Mocks for MAT, ATMA and CMAT", basic: { kind: "none" }, plus: { kind: "number", text: "15" } },
  { label: "CET masterclasses by JBIMS and top B-school alumni", basic: { kind: "none" }, plus: { kind: "number", text: "10" } },
  { label: "Notification alerts", basic: { kind: "included" }, plus: { kind: "included" } },
  { label: "Application guidance and institute shortlisting", basic: { kind: "included" }, plus: { kind: "included" } },
  { label: "Interview prep and strategy sessions", basic: { kind: "included" }, plus: { kind: "included" } },
  { label: "Regular price", basic: { kind: "strike", text: "₹9,999" }, plus: { kind: "strike", text: "₹12,999" } },
];

const MOCK_STATS = [
  { big: "20", title: "Mock CETs", sub: "5 in Basic + 15 extra in Plus" },
  { big: "15", title: "MAT, ATMA & CMAT mocks", sub: "Keep more colleges in play" },
  { big: "10", title: "CET masterclasses", sub: "By JBIMS & top B-school alumni" },
  { big: "1:1", title: "Feedback and analysis", sub: "After every mock you attempt" },
];

const STEPS = [
  { title: "Fill the form", body: "Takes 30 seconds. Pick CET Basic or CET Plus — you can switch later." },
  { title: "Counselling call", body: "We call within 24 hours to understand your target colleges and confirm your batch." },
  { title: "Train and test", body: "Live classes, recordings, and mocks with analysis through to exam day." },
  { title: "Apply and convert", body: "Shortlisting, applications, CAP rounds and interview prep, with us alongside." },
];

const WHY = [
  { title: "Career-first, not coaching-first", body: "MBA Prof was built as a consulting platform. The exam is the tool; the college and the career are the point." },
  { title: "Admissions help is included, not extra", body: "Shortlisting, applications, CAP rounds and interview preparation come inside the program fee." },
  { title: "Among India's most affordable", body: "Full-length CET training at introductory pricing, from a Navi Mumbai team that knows the Maharashtra admission process first-hand." },
];

const QUOTES = [
  { quote: "I was preparing hard, but not preparing smart. MBA Prof structured my plan and turned that effort into results.", who: "Kaushik Bajaj", role: "Research Analyst, Morgan Stanley" },
  { quote: "I was confused between colleges and roles. MBA Prof helped me pick the right direction, not just the popular one.", who: "Nawab Falak", role: "Portfolio Accountant, Opus (PGDM Finance)" },
];

const FAQ = [
  { q: "Is CET Basic really free?", a: "Yes. The regular price is ₹9,999, and it is free for the first 200 students who register through this page. There is no card and no payment at registration." },
  { q: "What exactly does CET Plus add?", a: "Everything in CET Basic, plus 15 additional mock CETs (20 in total), 15 mocks for MAT, ATMA and CMAT, and 10 CET masterclasses taught by alumni of JBIMS and other top B-schools. It is ₹2,999 inclusive of GST against a regular price of ₹12,999." },
  { q: "Are the classes live or recorded?", a: "Both. All 120+ hours are delivered live online, and every class is available in recorded format so you can revisit it whenever you need to. The material itself is designed from the last 10 years of actual CET papers." },
  { q: "Can I start with Basic and upgrade later?", a: "Yes. Many students start with CET Basic and move to CET Plus once mock season begins. Your counsellor will tell you how the upgrade is priced at that time." },
  { q: "Do you help after the exam too?", a: "Yes. Notification alerts, application guidance, institute shortlisting and interview preparation are part of both programs, so the support continues through the admission season." },
  { q: "When does the batch start?", a: "The next online batch begins on 14 November 2026. Register now to hold your introductory seat; our counsellor confirms your schedule and login on the call." },
];

function CompareCell({ cell, plus = false }: { cell: Cell; plus?: boolean }) {
  const base = `px-5 py-3.5 text-center ${plus ? "bg-[#FEF6F2]" : ""}`;
  switch (cell.kind) {
    case "included":
      return <td className={`${base} text-[14.5px] font-semibold text-[#15803D]`}>Included</td>;
    case "none":
      return <td className={`${base} text-[15px] font-medium text-[#94A3B8]`}>Not included</td>;
    case "number":
      return <td className={`${base} text-[15px] font-bold text-[#0B1F3A]`}>{cell.text}</td>;
    case "strike":
      return <td className={`${base} text-[14.5px] font-medium text-[#64748B] line-through`}>{cell.text}</td>;
    default:
      return <td className={base}>{cell.text}</td>;
  }
}

export default function Cet2027LandingPage() {
  const pixelId = metaPixelId();

  return (
    <>
      <MetaPixel pixelId={pixelId} />

      {/* OFFER STRIP */}
      <div className="w-full bg-[#C2410C] px-6 py-2.5 text-white">
        <div className={`${wrap} flex flex-wrap items-center justify-center gap-x-[18px] gap-y-2 text-center`}>
          <span className="text-[13px] font-bold tracking-[0.4px]">INTRODUCTORY OFFER</span>
          <span className="text-[13px] font-medium opacity-95">
            CET Basic FREE (worth ₹9,999) · CET Plus at ₹2,999 incl. GST · First 200 students only
          </span>
        </div>
      </div>

      {/* HEADER */}
      <header className="w-full border-b border-[#E2E8F0] bg-white px-6 py-3.5">
        <div className={`${wrap} flex flex-wrap items-center justify-between gap-x-5 gap-y-3`}>
          <div className="flex items-center gap-3.5">
            <Image
              src="/logo.png"
              alt="MBA Prof"
              width={1794}
              height={372}
              sizes="250px"
              priority
              className="h-[46px] w-auto flex-none sm:h-[52px]"
            />
            <div className="hidden h-8 w-px flex-none bg-[#E2E8F0] sm:block" />
            <div className="hidden max-w-[150px] text-[11px] font-semibold leading-[1.4] tracking-[0.6px] text-[#64748B] sm:block">
              CAREER-FIRST MBA CONSULTING
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-x-[18px] gap-y-2.5">
            <a
              href={TEL}
              className="flex min-h-11 items-center gap-[7px] text-sm font-semibold text-[#0B1F3A] no-underline"
            >
              <Icon size={16} stroke="#64748B">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.35 1.9.66 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.31 1.85.53 2.81.66A2 2 0 0 1 22 16.92z" />
              </Icon>
              <span className="hidden sm:inline">{PHONE}</span>
              <span className="sm:hidden">Call us</span>
            </a>
            <a
              href="#register"
              className="inline-flex min-h-11 items-center rounded-[10px] bg-[#C2410C] px-5 py-[13px] text-sm font-bold text-white no-underline hover:bg-[#9A3412]"
            >
              Claim free seat
            </a>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="w-full bg-gradient-to-b from-[#F8FAFC] to-white px-6 pb-16 pt-10 sm:pt-14">
        <div className={`${wrap} flex flex-wrap items-start gap-10`}>
          <div className="min-w-0 flex-[1.15_1_500px]">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-[#E8EEF6] px-[13px] py-[7px] text-xs font-bold tracking-[0.8px] text-[#0B4F8A]">
              <span className="inline-block h-[7px] w-[7px] flex-none rounded-full bg-[#C2410C]" />
              MH-CET (MBA/MMS) 2027 · BATCH STARTS 14 NOVEMBER
            </div>

            <h1 className={`${heading} mb-[18px] text-[32px] font-extrabold leading-[1.12] tracking-[-0.8px] text-[#0B1F3A] sm:text-[40px] lg:text-[46px] lg:leading-[1.1]`}>
              Crack CET 2027 — then get into the right college, not just any college.
            </h1>

            <p className="mb-[26px] max-w-[560px] text-base leading-[1.6] text-[#475569] sm:text-lg">
              120+ hours of live online training with every class recorded, material built from 10 years of actual CET papers, mock CETs with one-on-one feedback, and admission guidance that runs from form-filling to the interview panel.
            </p>

            <div className="mb-[26px] flex flex-wrap gap-3.5">
              <div className="min-w-0 flex-[1_1_220px] rounded-[14px] border border-[#CBD5E1] bg-white px-[18px] py-4">
                <div className="mb-2 text-[13px] font-bold tracking-[0.4px] text-[#64748B]">CET BASIC</div>
                <div className="flex items-baseline gap-2.5">
                  <span className="text-base font-medium text-[#64748B] line-through">₹9,999</span>
                  <span className={`${heading} text-[30px] font-extrabold text-[#15803D]`}>FREE</span>
                </div>
                <div className="mt-1.5 text-xs font-medium text-[#64748B]">For the first 200 students</div>
              </div>
              <div className="min-w-0 flex-[1_1_220px] rounded-[14px] border-2 border-[#C2410C] bg-white px-[17px] py-[15px]">
                <div className="mb-2 text-[13px] font-bold tracking-[0.4px] text-[#C2410C]">CET PLUS</div>
                <div className="flex items-baseline gap-2.5">
                  <span className="text-base font-medium text-[#64748B] line-through">₹12,999</span>
                  <span className={`${heading} text-[30px] font-extrabold text-[#0B1F3A]`}>₹2,999</span>
                </div>
                <div className="mt-1.5 text-xs font-medium text-[#64748B]">Incl. GST · first 200 students</div>
              </div>
            </div>

            <ul className="m-0 flex list-none flex-wrap gap-2.5 p-0">
              {HERO_CHIPS.map((chip) => (
                <li
                  key={chip}
                  className="flex items-center gap-[7px] rounded-full border border-[#E2E8F0] bg-white px-3.5 py-[9px] text-[13px] font-semibold text-[#334155]"
                >
                  <Check size={15} />
                  {chip}
                </li>
              ))}
            </ul>
          </div>

          {/* LEAD FORM */}
          <div
            id="register"
            className="relative min-w-0 flex-[1_1_390px] scroll-mt-4 rounded-[18px] border border-[#E2E8F0] bg-white p-[22px] shadow-[0_12px_32px_rgba(11,31,58,0.10)] sm:p-[26px]"
          >
            <h2 className={`${heading} mb-1.5 text-[23px] font-extrabold text-[#0B1F3A]`}>Book your introductory seat</h2>
            <p className="mb-4 text-sm leading-[1.5] text-[#64748B]">
              Takes 30 seconds. A counsellor calls you within 24 hours to confirm your batch.
            </p>

            <div className="mb-5 flex items-center gap-2.5 rounded-[10px] bg-[#F1F5F9] px-3.5 py-3">
              <Icon size={18} stroke="#0B4F8A">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </Icon>
              <span className="text-[13.5px] font-medium text-[#334155]">
                Batch starts <strong className="font-bold text-[#0B1F3A]">14 November 2026</strong>
              </span>
            </div>

            <LeadForm />
          </div>
        </div>
      </section>

      {/* COLLEGE BAND */}
      <section className="w-full bg-[#0B1F3A] px-6 py-[30px]">
        <div className={`${wrap} text-center`}>
          <p className="mb-3.5 text-xs font-semibold tracking-[1.4px] text-[#94A3B8]">
            PREPARATION AND ADMISSION GUIDANCE FOR MH-CET COLLEGES
          </p>
          <div className="flex flex-wrap justify-center gap-x-3.5 gap-y-2.5">
            {COLLEGES.map((college, i) => (
              <span key={college} className="flex items-center gap-3.5">
                <span className={`${heading} text-[15px] font-bold text-[#E2E8F0]`}>{college}</span>
                {i < COLLEGES.length - 1 && (
                  <span aria-hidden="true" className="text-[#475569]">
                    •
                  </span>
                )}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* WHAT YOU GET */}
      <section className="w-full bg-white px-6 py-[72px]">
        <div className={wrap}>
          <p className={eyebrow}>WHAT EVERY STUDENT GETS</p>
          <h2 className={`${h2} mb-3 text-[28px] leading-[1.15] sm:text-4xl`}>Coaching and admissions, under one roof</h2>
          <p className="mb-10 max-w-[640px] text-[17px] leading-[1.6] text-[#475569]">
            Every feature below is included in both CET Basic and CET Plus. Nothing is sold as an add-on later.
          </p>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex flex-wrap items-start gap-[22px] rounded-2xl border border-[#C7D7EA] bg-[#E8EEF6] p-6 sm:col-span-2 sm:p-7 lg:col-span-3">
              <div className="flex h-12 w-12 flex-none items-center justify-center rounded-xl bg-[#0B4F8A]">
                <Icon size={24} stroke="#FFFFFF">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </Icon>
              </div>
              <div className="min-w-0 flex-[1_1_420px]">
                <h3 className={`${heading} mb-2 text-xl font-bold text-[#0B1F3A] sm:text-[21px]`}>
                  Course material designed from the last 10 years of actual CET papers
                </h3>
                <p className="text-[15.5px] leading-[1.6] text-[#334155]">
                  Every module, worksheet and test is built backwards from ten years of real MH-CET question papers, so you drill the patterns that actually repeat instead of generic aptitude practice. All classes are delivered online, and every single session is available to you in recorded format.
                </p>
              </div>
            </div>

            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-6">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-[11px] bg-[#E8EEF6]">{f.icon}</div>
                <h3 className={`${heading} mb-2 text-lg font-bold text-[#0B1F3A]`}>{f.title}</h3>
                <p className="text-[14.5px] leading-[1.6] text-[#475569]">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="w-full scroll-mt-4 bg-[#F1F5F9] px-6 py-[72px]">
        <div className={wrap}>
          <div className="mb-10 text-center">
            <p className={eyebrow}>CHOOSE YOUR PROGRAM</p>
            <h2 className={`${h2} mb-3 text-[28px] leading-[1.15] sm:text-4xl`}>Two ways in. Both at introductory pricing.</h2>
            <p className="mx-auto max-w-[620px] text-[17px] leading-[1.6] text-[#475569]">
              Introductory pricing applies to the first 200 registrations only. After that, regular fees resume.
            </p>
          </div>

          <div className="flex flex-wrap items-stretch gap-6">
            {/* Basic */}
            <div className="flex min-w-0 flex-[1_1_380px] flex-col rounded-[18px] border border-[#CBD5E1] bg-white p-[26px] sm:p-[30px]">
              <div className="mb-[18px] inline-flex self-start rounded-full bg-[#DCFCE7] px-[11px] py-1.5 text-[11.5px] font-bold tracking-[0.6px] text-[#166534]">
                FREE FOR FIRST 200
              </div>
              <h3 className={`${heading} mb-1.5 text-[26px] font-extrabold text-[#0B1F3A]`}>CET Basic</h3>
              <p className="mb-5 text-[14.5px] leading-[1.5] text-[#64748B]">
                Everything you need to prepare for CET 2027 and apply with confidence.
              </p>
              <div className="mb-1 flex items-baseline gap-3">
                <span className="text-xl font-medium text-[#94A3B8] line-through">₹9,999</span>
                <span className={`${heading} text-[44px] font-extrabold tracking-[-1px] text-[#15803D]`}>₹0</span>
              </div>
              <p className="mb-6 text-[13px] font-medium text-[#64748B]">Introductory offer · no payment required</p>
              <ul className="mb-[26px] flex flex-1 list-none flex-col gap-3 p-0">
                {BASIC_LIST.map((item) => (
                  <li key={item} className="flex gap-[11px] text-[15px] leading-[1.5] text-[#334155]">
                    <Check className="mt-[3px]" />
                    {item}
                  </li>
                ))}
              </ul>
              <a
                href="#register"
                data-plan="BASIC"
                className="flex min-h-[52px] items-center justify-center rounded-xl bg-[#0B1F3A] text-[15.5px] font-bold text-white no-underline hover:bg-[#12305c]"
              >
                Claim CET Basic free
              </a>
            </div>

            {/* Plus */}
            <div className="flex min-w-0 flex-[1_1_380px] flex-col rounded-[18px] border-2 border-[#C2410C] bg-white p-[25px] shadow-[0_14px_34px_rgba(11,31,58,0.12)] sm:p-[29px]">
              <div className="mb-[18px] inline-flex self-start rounded-full bg-[#C2410C] px-[11px] py-1.5 text-[11.5px] font-bold tracking-[0.6px] text-white">
                MOST CHOSEN · BEST VALUE
              </div>
              <h3 className={`${heading} mb-1.5 text-[26px] font-extrabold text-[#0B1F3A]`}>CET Plus</h3>
              <p className="mb-5 text-[14.5px] leading-[1.5] text-[#64748B]">
                For students who want serious test practice, insider guidance, and a backup plan beyond CET.
              </p>
              <div className="mb-1 flex items-baseline gap-3">
                <span className="text-xl font-medium text-[#94A3B8] line-through">₹12,999</span>
                <span className={`${heading} text-[44px] font-extrabold tracking-[-1px] text-[#0B1F3A]`}>₹2,999</span>
              </div>
              <p className="mb-6 text-[13px] font-medium text-[#64748B]">Inclusive of GST · introductory offer</p>
              <p className="mb-3.5 text-sm font-bold text-[#0B1F3A]">Everything in CET Basic, plus:</p>
              <ul className="mb-[26px] flex flex-1 list-none flex-col gap-3 p-0">
                {PLUS_LIST.map((item, i) => (
                  <li key={i} className="flex gap-[11px] text-[15px] leading-[1.5] text-[#334155]">
                    <Check className="mt-[3px]" />
                    <span>
                      {item.bold && <strong className="font-bold">{item.bold}</strong>}
                      {item.text}
                    </span>
                  </li>
                ))}
              </ul>
              <a
                href="#register"
                data-plan="PLUS"
                className="flex min-h-[52px] items-center justify-center rounded-xl bg-[#C2410C] text-[15.5px] font-bold text-white no-underline hover:bg-[#9A3412]"
              >
                Get CET Plus at ₹2,999
              </a>
            </div>
          </div>

          {/* Comparison */}
          <div className="mt-9 overflow-hidden rounded-2xl border border-[#CBD5E1] bg-white">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] border-collapse">
                <caption className={`${heading} px-6 pt-5 text-left text-[17px] font-bold text-[#0B1F3A]`}>
                  Side-by-side comparison
                </caption>
                <thead>
                  <tr>
                    <th scope="col" className="border-b border-[#E2E8F0] px-6 py-4 text-left text-[13px] font-bold tracking-[0.4px] text-[#64748B]">
                      WHAT YOU GET
                    </th>
                    <th scope="col" className="w-[150px] border-b border-[#E2E8F0] px-5 py-4 text-center text-[13px] font-bold tracking-[0.4px] text-[#64748B]">
                      CET BASIC
                    </th>
                    <th scope="col" className="w-[150px] border-b border-[#E2E8F0] bg-[#FEF6F2] px-5 py-4 text-center text-[13px] font-bold tracking-[0.4px] text-[#C2410C]">
                      CET PLUS
                    </th>
                  </tr>
                </thead>
                <tbody className="[&>tr>*]:border-b [&>tr>*]:border-[#F1F5F9]">
                  {COMPARE.map((row) => (
                    <tr key={row.label}>
                      <th scope="row" className="px-6 py-3.5 text-left text-[14.5px] font-normal text-[#334155]">
                        {row.label}
                      </th>
                      <CompareCell cell={row.basic} />
                      <CompareCell cell={row.plus} plus />
                    </tr>
                  ))}
                  <tr className="[&>*]:!border-b-0">
                    <th scope="row" className="px-6 py-4 text-left text-[14.5px] font-bold text-[#0B1F3A]">
                      Introductory price (first 200 students)
                    </th>
                    <td className={`${heading} px-5 py-4 text-center text-lg font-extrabold text-[#15803D]`}>FREE</td>
                    <td className={`${heading} bg-[#FEF6F2] px-5 py-4 text-center text-lg font-extrabold text-[#0B1F3A]`}>₹2,999</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* MOCK MATH */}
      <section className="w-full bg-[#0B1F3A] px-6 py-16">
        <div className={wrap}>
          <h2 className={`${heading} mb-2.5 text-center text-[26px] font-extrabold leading-[1.15] tracking-[-0.5px] text-white sm:text-[34px]`}>
            CET Plus: 35 mocks and 10 masterclasses before exam day
          </h2>
          <p className="mx-auto mb-9 max-w-[620px] text-center text-[16.5px] leading-[1.6] text-[#CBD5E1]">
            Scores move when practice is measured. Every mock is followed by analysis, and the masterclasses are taught by people who sat this exam and got into the colleges you are aiming for.
          </p>
          <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4 lg:gap-[18px]">
            {MOCK_STATS.map((s) => (
              <div key={s.title} className="rounded-2xl border border-[#1E3A66] bg-[#122C51] p-5 text-center sm:p-[26px]">
                <div className={`${heading} text-[38px] font-extrabold leading-none tracking-[-1px] text-white sm:text-[46px]`}>{s.big}</div>
                <div className="mt-2.5 text-sm font-semibold text-[#CBD5E1] sm:text-[14.5px]">{s.title}</div>
                <div className="mt-[5px] text-[13px] text-[#94A3B8]">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="w-full bg-white px-6 py-[72px]">
        <div className={wrap}>
          <p className={eyebrow}>HOW IT WORKS</p>
          <h2 className={`${h2} mb-10 text-[28px] leading-[1.15] sm:text-4xl`}>From this form to your admission letter</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, i) => (
              <div key={step.title} className={`border-t-[3px] pt-5 ${i === 0 ? "border-[#C2410C]" : "border-[#CBD5E1]"}`}>
                <div className={`mb-2.5 text-[13px] font-extrabold tracking-[1px] ${i === 0 ? "text-[#C2410C]" : "text-[#64748B]"}`}>
                  STEP {String(i + 1).padStart(2, "0")}
                </div>
                <h3 className={`${heading} mb-2 text-lg font-bold text-[#0B1F3A]`}>{step.title}</h3>
                <p className="text-[14.5px] leading-[1.6] text-[#475569]">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY US */}
      <section className="w-full bg-[#F8FAFC] px-6 py-[72px]">
        <div className={`${wrap} flex flex-wrap gap-10`}>
          <div className="min-w-0 flex-[1_1_440px]">
            <p className={eyebrow}>WHY MBA PROF</p>
            <h2 className={`${h2} mb-[26px] text-[28px] leading-[1.2] sm:text-[34px]`}>
              A percentile is not an outcome. We train for both.
            </h2>
            {WHY.map((w) => (
              <div key={w.title} className="mb-[22px] flex gap-3.5 last:mb-0">
                <div className="mt-[7px] h-2.5 w-2.5 flex-none rounded-full bg-[#C2410C]" />
                <div>
                  <h3 className={`${heading} mb-[5px] text-[17px] font-bold text-[#0B1F3A]`}>{w.title}</h3>
                  <p className="text-[15px] leading-[1.6] text-[#475569]">{w.body}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex min-w-0 flex-[1_1_360px] flex-col gap-4">
            {QUOTES.map((q) => (
              <blockquote key={q.who} className="m-0 rounded-2xl border border-[#E2E8F0] bg-white p-6">
                <p className="mb-4 text-[15.5px] leading-[1.65] text-[#334155]">{q.quote}</p>
                <footer className="text-sm font-semibold text-[#0B1F3A]">
                  {q.who}
                  <span className="mt-[3px] block text-[13px] font-normal text-[#64748B]">{q.role}</span>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="w-full bg-white px-6 py-[72px]">
        <div className="mx-auto max-w-[820px]">
          <h2 className={`${h2} mb-9 text-center text-[28px] leading-[1.15] sm:text-[34px]`}>
            Questions students ask before registering
          </h2>
          {FAQ.map((item, i) => (
            <div
              key={item.q}
              className={i < FAQ.length - 1 ? "mb-5 border-b border-[#E2E8F0] pb-5" : ""}
            >
              <h3 className={`${heading} mb-2 text-[17.5px] font-bold text-[#0B1F3A]`}>{item.q}</h3>
              <p className="text-[15.5px] leading-[1.65] text-[#475569]">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="w-full bg-[#C2410C] px-6 py-16">
        <div className="mx-auto max-w-[760px] text-center">
          <h2 className={`${heading} mb-3.5 text-[28px] font-extrabold leading-[1.15] tracking-[-0.5px] text-white sm:text-4xl`}>
            Batch starts 14 November. 200 seats, then prices go back up.
          </h2>
          <p className="mb-7 text-[17px] leading-[1.6] text-[#FFF1E9]">
            CET Basic at ₹0 instead of ₹9,999. CET Plus at ₹2,999 instead of ₹12,999. Hold your seat before the counter runs out.
          </p>
          <div className="flex flex-wrap justify-center gap-3.5">
            <a
              href="#register"
              className="inline-flex min-h-[54px] items-center justify-center rounded-xl bg-white px-[30px] text-base font-bold text-[#0B1F3A] no-underline hover:bg-[#F8FAFC]"
            >
              Claim my introductory seat
            </a>
            <a
              href={TEL}
              className="inline-flex min-h-[54px] items-center justify-center rounded-xl border-2 border-white/55 px-[30px] text-base font-bold text-white no-underline hover:bg-white/10"
            >
              Talk to a counsellor
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="w-full bg-[#0B1F3A] px-6 pb-8 pt-11">
        <div className={wrap}>
          <div className="flex flex-wrap justify-between gap-7 border-b border-[#1E3A66] pb-7">
            <div className="min-w-0 flex-[1_1_280px]">
              <div className={`${heading} mb-2 text-xl font-extrabold text-white`}>
                MBA <span className="text-[#F2B134]">Prof</span>
              </div>
              <p className="max-w-[320px] text-sm leading-[1.6] text-[#94A3B8]">
                India&apos;s most affordable MBA entrance learning platform.
              </p>
            </div>
            <div className="min-w-0 flex-[1_1_240px]">
              <div className="mb-3 text-[13px] font-bold tracking-[0.6px] text-[#CBD5E1]">GET IN TOUCH</div>
              <p className="mb-2 text-sm leading-[1.6] text-[#94A3B8]">
                1st Floor, Plot No. 149, Sector 12, Juhu Nagar Road, Vashi, Navi Mumbai 400703
              </p>
              <p className="text-sm leading-[1.8] text-[#94A3B8]">
                <a href="mailto:info@mbaprof.in" className="text-[#94A3B8] no-underline hover:text-white">
                  info@mbaprof.in
                </a>
                <br />
                <a href={TEL} className="text-[#94A3B8] no-underline hover:text-white">
                  {PHONE}
                </a>{" "}
                ·{" "}
                <a href="tel:+918291181713" className="text-[#94A3B8] no-underline hover:text-white">
                  +91 82911 81713
                </a>
              </p>
            </div>
            <div className="min-w-0 flex-[0_1_220px]">
              <div className="mb-3 text-[13px] font-bold tracking-[0.6px] text-[#CBD5E1]">PROGRAM</div>
              <p className="text-sm leading-[1.9] text-[#94A3B8]">
                CET Basic — free for first 200
                <br />
                CET Plus — ₹2,999 incl. GST
              </p>
            </div>
          </div>
          <p className="mt-[22px] text-[12.5px] leading-[1.7] text-[#64748B]">
            CET 2027 refers to the MH-CET (MBA/MMS) entrance examination. MBA Prof is an independent training and admission consulting provider and is not affiliated with the State Common Entrance Test Cell, Government of Maharashtra. Introductory pricing is limited to the first 200 registrations and may be withdrawn at any time. © 2026 MBA Prof. All rights reserved.
          </p>
        </div>
      </footer>
    </>
  );
}
