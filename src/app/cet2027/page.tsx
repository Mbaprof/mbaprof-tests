import type { Metadata } from "next";
import Image from "next/image";

import { metaPixelId } from "@/lib/meta-pixel";

import { LeadForm } from "./lead-form";
import { MetaPixel } from "./meta-pixel";
import { StickyCta } from "./sticky-cta";

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

// Brand palette lives in globals.css (brand-navy, brand-gold, brand-cream ...).
// The serif headline face echoes the MBA Prof logo; body copy stays in Inter.
const heading = "font-heading";
const wrap = "mx-auto max-w-[1160px]";
const PHONE = "+91 84337 47631";
const TEL = "tel:+918433747631";

const LABEL = "font-label"; // Montserrat: tagline and small labels
const GOLD_TEXT = "text-brand-navy"; // gold is for fills and accents; text on light grounds stays navy
const BODY = "text-[#333333]";
const MUTED = "text-[#5f5f5f]";
const LINE = "border-[#dfd0c6]";

// ---- small building blocks ------------------------------------------------------------

function Check({ size = 20, className = "" }: { size?: number; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-flex flex-none items-center justify-center rounded-full bg-brand-gold ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={Math.round(size * 0.58)}
        height={Math.round(size * 0.58)}
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
  );
}

function Icon({ children, size = 22, stroke = "#f4b027" }: { children: React.ReactNode; size?: number; stroke?: string }) {
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

// The gold arrow flag is the brand manual's heading marker.
const eyebrow = `${LABEL} mb-3 flex items-center gap-3 text-xs font-bold tracking-[1.6px] ${GOLD_TEXT} before:h-[18px] before:w-7 before:bg-brand-gold before:[clip-path:polygon(0_0,72%_0,100%_50%,72%_100%,0_100%)]`;
const h2 = `${heading} font-extrabold tracking-[-0.3px] text-brand-navy`;

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
  const base = `px-5 py-3.5 text-center ${plus ? "bg-[#fff4e3]" : ""}`;
  switch (cell.kind) {
    case "included":
      return (
        <td className={base}>
          <span className="inline-flex items-center justify-center gap-1.5 text-[14.5px] font-semibold text-brand-navy">
            <Check size={18} />
            Included
          </span>
        </td>
      );
    case "none":
      return <td className={`${base} text-[15px] font-medium text-[#8c8c8c]`}>Not included</td>;
    case "number":
      return <td className={`${base} ${heading} text-lg font-extrabold text-brand-navy`}>{cell.text}</td>;
    case "strike":
      return <td className={`${base} text-[14.5px] font-medium ${MUTED} line-through`}>{cell.text}</td>;
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
      <div className="w-full bg-brand-gold px-6 py-2.5 text-brand-navy">
        <div className={`${wrap} flex flex-wrap items-center justify-center gap-x-[18px] gap-y-1 text-center`}>
          <span className="text-[13px] font-extrabold tracking-[0.8px]">INTRODUCTORY OFFER</span>
          <span className="text-[13px] font-semibold">
            CET Basic FREE (worth ₹9,999) · CET Plus at ₹2,999 incl. GST · First 200 students only
          </span>
        </div>
      </div>

      {/* HEADER */}
      <header className={`w-full border-b ${LINE} bg-white px-6 py-3.5`}>
        <div className={`${wrap} flex flex-wrap items-center justify-between gap-x-5 gap-y-3`}>
          <div className="flex items-center gap-3.5">
            <Image
              src="/logo.png"
              alt="MBA Prof"
              width={1794}
              height={372}
              sizes="250px"
              priority
              className="h-[42px] w-auto flex-none sm:h-[50px]"
            />
            <div className={`hidden h-8 w-px flex-none bg-[#dfd0c6] sm:block`} />
            <div className={`${LABEL} hidden max-w-[150px] text-[11px] font-medium leading-[1.4] tracking-[0.6px] ${MUTED} sm:block`}>
              CAREER-FIRST MBA CONSULTING
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-x-[18px] gap-y-2.5">
            <a
              href={TEL}
              className="flex min-h-11 items-center gap-[7px] text-sm font-semibold text-brand-navy no-underline hover:text-[#c07c08]"
            >
              <Icon size={16} stroke="#c07c08">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.35 1.9.66 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.31 1.85.53 2.81.66A2 2 0 0 1 22 16.92z" />
              </Icon>
              <span className="hidden sm:inline">{PHONE}</span>
              <span className="sm:hidden">Call us</span>
            </a>
            <a
              href="#register"
              className="inline-flex min-h-11 items-center rounded-[10px] bg-brand-navy px-5 py-[13px] text-sm font-bold text-white no-underline transition-colors hover:bg-brand-navy-light"
            >
              Claim free seat
            </a>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section
        className="relative w-full overflow-hidden bg-brand-navy px-6 pb-20 pt-12 sm:pt-16"
        style={{
          backgroundImage:
            "radial-gradient(900px 480px at 90% -10%, rgba(244,176,39,0.20), transparent 62%), radial-gradient(760px 420px at -5% 108%, rgba(38,74,118,0.55), transparent 70%)",
        }}
      >
        <div className={`${wrap} flex flex-wrap items-start gap-12`}>
          <div className="min-w-0 flex-[1.15_1_500px]">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-gold/40 bg-white/5 px-3.5 py-[7px] text-xs font-bold tracking-[0.8px] text-brand-gold-light">
              <span className="inline-block h-[7px] w-[7px] flex-none rounded-full bg-brand-gold" />
              MH-CET (MBA/MMS) 2027 · BATCH STARTS 14 NOVEMBER
            </div>

            <h1 className={`${heading} mb-5 text-[34px] font-extrabold leading-[1.12] tracking-[-0.5px] text-white sm:text-[44px] lg:text-[52px] lg:leading-[1.08]`}>
              Crack CET 2027 — then get into the right college,{" "}
              <span className="text-brand-gold">not just any college.</span>
            </h1>

            <p className="mb-8 max-w-[560px] text-base leading-[1.65] text-[#e6e7e8] sm:text-lg">
              120+ hours of live online training with every class recorded, material built from 10 years of actual CET papers, mock CETs with one-on-one feedback, and admission guidance that runs from form-filling to the interview panel.
            </p>

            <div className="mb-7 flex flex-wrap gap-3.5">
              <div className="min-w-0 flex-[1_1_220px] rounded-2xl border border-white/15 bg-white/[0.06] px-5 py-[18px] backdrop-blur-sm">
                <div className="mb-2 text-[13px] font-bold tracking-[0.6px] text-[#c9cbce]">CET BASIC</div>
                <div className="flex items-baseline gap-2.5">
                  <span className="text-base font-medium text-[#a9acb0] line-through">₹9,999</span>
                  <span className={`${heading} text-[32px] font-extrabold leading-none text-brand-gold-light`}>FREE</span>
                </div>
                <div className="mt-2 text-xs font-medium text-[#c9cbce]">For the first 200 students</div>
              </div>
              <div className="min-w-0 flex-[1_1_220px] rounded-2xl border-2 border-brand-gold bg-white/10 px-[19px] py-[17px] shadow-[0_10px_30px_rgba(244,176,39,0.15)] backdrop-blur-sm">
                <div className="mb-2 text-[13px] font-bold tracking-[0.6px] text-brand-gold">CET PLUS</div>
                <div className="flex items-baseline gap-2.5">
                  <span className="text-base font-medium text-[#a9acb0] line-through">₹12,999</span>
                  <span className={`${heading} text-[32px] font-extrabold leading-none text-white`}>₹2,999</span>
                </div>
                <div className="mt-2 text-xs font-medium text-[#c9cbce]">Incl. GST · first 200 students</div>
              </div>
            </div>

            <ul className="m-0 flex list-none flex-wrap gap-2.5 p-0">
              {HERO_CHIPS.map((chip) => (
                <li
                  key={chip}
                  className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 py-[7px] pl-2.5 pr-3.5 text-[13px] font-semibold text-[#e6e7e8]"
                >
                  <Check size={18} />
                  {chip}
                </li>
              ))}
            </ul>
          </div>

          {/* LEAD FORM */}
          <div
            id="register"
            className="relative min-w-0 flex-[1_1_390px] scroll-mt-4 rounded-[20px] border-t-4 border-brand-gold bg-white p-6 shadow-[0_28px_70px_rgba(0,0,0,0.45)] sm:p-8"
          >
            <h2 className={`${heading} mb-1.5 text-[25px] font-extrabold text-brand-navy`}>Book your introductory seat</h2>
            <p className={`mb-4 text-sm leading-[1.55] ${MUTED}`}>
              Takes 30 seconds. A counsellor calls you within 24 hours to confirm your batch.
            </p>

            <div className="mb-5 flex items-center gap-2.5 rounded-xl border border-[#dfd0c6] bg-[#f6f0ec] px-3.5 py-3">
              <Icon size={18} stroke="#c07c08">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </Icon>
              <span className="text-[13.5px] font-medium text-[#333333]">
                Batch starts <strong className="font-bold text-brand-navy">14 November 2026</strong>
              </span>
            </div>

            <LeadForm />
          </div>
        </div>
      </section>

      {/* COLLEGE BAND */}
      <section className="w-full border-t border-white/10 bg-brand-navy-light px-6 py-[30px]">
        <div className={`${wrap} text-center`}>
          <p className="mb-3.5 text-xs font-semibold tracking-[1.6px] text-brand-gold">
            PREPARATION AND ADMISSION GUIDANCE FOR MH-CET COLLEGES
          </p>
          <div className="flex flex-wrap justify-center gap-x-3.5 gap-y-2.5">
            {COLLEGES.map((college, i) => (
              <span key={college} className="flex items-center gap-3.5">
                <span className={`${heading} text-base font-extrabold text-white`}>{college}</span>
                {i < COLLEGES.length - 1 && (
                  <span aria-hidden="true" className="text-brand-gold/70">
                    ◆
                  </span>
                )}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* WHAT YOU GET */}
      <section className="w-full bg-white px-6 py-20">
        <div className={wrap}>
          <p className={eyebrow}>WHAT EVERY STUDENT GETS</p>
          <h2 className={`${h2} mb-3 text-[30px] leading-[1.15] sm:text-[40px]`}>Coaching and admissions, under one roof</h2>
          <p className={`mb-11 max-w-[640px] text-[17px] leading-[1.65] ${BODY}`}>
            Every feature below is included in both CET Basic and CET Plus. Nothing is sold as an add-on later.
          </p>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <div
              className="flex flex-wrap items-start gap-[22px] rounded-[20px] bg-brand-navy p-6 sm:col-span-2 sm:p-8 lg:col-span-3"
              style={{ backgroundImage: "radial-gradient(520px 260px at 100% 0%, rgba(244,176,39,0.18), transparent 65%)" }}
            >
              <div className="flex h-[52px] w-[52px] flex-none items-center justify-center rounded-[14px] bg-brand-gold">
                <Icon size={26} stroke="#0b1d2e">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </Icon>
              </div>
              <div className="min-w-0 flex-[1_1_420px]">
                <h3 className={`${heading} mb-2.5 text-[22px] font-extrabold leading-[1.25] text-white sm:text-[24px]`}>
                  Course material designed from the last 10 years of actual CET papers
                </h3>
                <p className="text-[15.5px] leading-[1.65] text-[#e6e7e8]">
                  Every module, worksheet and test is built backwards from ten years of real MH-CET question papers, so you drill the patterns that actually repeat instead of generic aptitude practice. All classes are delivered online, and every single session is available to you in recorded format.
                </p>
              </div>
            </div>

            {FEATURES.map((f) => (
              <div
                key={f.title}
                className={`group flex gap-4 rounded-[18px] border ${LINE} bg-[#f6f0ec] p-5 transition duration-200 hover:-translate-y-1 hover:border-brand-gold hover:bg-white hover:shadow-[0_14px_30px_rgba(11,29,46,0.10)] sm:block sm:p-6`}
              >
                <div className="flex h-12 w-12 flex-none items-center justify-center rounded-xl bg-brand-navy sm:mb-4">{f.icon}</div>
                <div className="min-w-0">
                  <h3 className={`${heading} mb-1.5 text-lg font-extrabold text-brand-navy sm:mb-2`}>{f.title}</h3>
                  <p className={`text-[14.5px] leading-[1.65] ${BODY}`}>{f.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="w-full scroll-mt-4 bg-[#f6f0ec] px-6 py-20">
        <div className={wrap}>
          <div className="mb-11 text-center">
            <p className={`${eyebrow} justify-center`}>CHOOSE YOUR PROGRAM</p>
            <h2 className={`${h2} mb-3 text-[30px] leading-[1.15] sm:text-[40px]`}>Two ways in. Both at introductory pricing.</h2>
            <p className={`mx-auto max-w-[620px] text-[17px] leading-[1.65] ${BODY}`}>
              Introductory pricing applies to the first 200 registrations only. After that, regular fees resume.
            </p>
          </div>

          <div className="flex flex-wrap items-stretch gap-6">
            {/* Basic */}
            <div className={`flex min-w-0 flex-[1_1_380px] flex-col rounded-[20px] border ${LINE} bg-white p-[26px] shadow-[0_4px_18px_rgba(11,29,46,0.05)] sm:p-8`}>
              <div className={`mb-[18px] inline-flex self-start rounded-full bg-brand-gold/20 px-3 py-1.5 text-[11.5px] font-bold tracking-[0.8px] ${GOLD_TEXT}`}>
                FREE FOR FIRST 200
              </div>
              <h3 className={`${heading} mb-1.5 text-[28px] font-extrabold text-brand-navy`}>CET Basic</h3>
              <p className={`mb-5 text-[14.5px] leading-[1.55] ${MUTED}`}>
                Everything you need to prepare for CET 2027 and apply with confidence.
              </p>
              <div className="mb-1 flex items-baseline gap-3">
                <span className="text-xl font-medium text-[#8c8c8c] line-through">₹9,999</span>
                <span className={`${heading} text-[48px] font-extrabold leading-none tracking-[-1px] text-brand-navy`}>₹0</span>
              </div>
              <p className={`mb-6 text-[13px] font-medium ${MUTED}`}>Introductory offer · no payment required</p>
              <ul className="mb-[26px] flex flex-1 list-none flex-col gap-3 p-0">
                {BASIC_LIST.map((item) => (
                  <li key={item} className="flex gap-[11px] text-[15px] leading-[1.5] text-[#333333]">
                    <Check className="mt-[1px]" />
                    {item}
                  </li>
                ))}
              </ul>
              <a
                href="#register"
                data-plan="BASIC"
                className="flex min-h-[54px] items-center justify-center rounded-xl bg-brand-navy text-[15.5px] font-bold text-white no-underline transition-colors hover:bg-brand-navy-light"
              >
                Claim CET Basic free
              </a>
            </div>

            {/* Plus */}
            <div
              className="relative flex min-w-0 flex-[1_1_380px] flex-col rounded-[20px] border-2 border-brand-gold bg-brand-navy p-[25px] shadow-[0_24px_54px_rgba(11,29,46,0.28)] sm:p-[31px]"
              style={{ backgroundImage: "radial-gradient(460px 240px at 100% 0%, rgba(244,176,39,0.16), transparent 65%)" }}
            >
              <div className="mb-[18px] inline-flex self-start rounded-full bg-brand-gold px-3 py-1.5 text-[11.5px] font-extrabold tracking-[0.8px] text-brand-navy">
                MOST CHOSEN · BEST VALUE
              </div>
              <h3 className={`${heading} mb-1.5 text-[28px] font-extrabold text-white`}>CET Plus</h3>
              <p className="mb-5 text-[14.5px] leading-[1.55] text-[#c9cbce]">
                For students who want serious test practice, insider guidance, and a backup plan beyond CET.
              </p>
              <div className="mb-1 flex items-baseline gap-3">
                <span className="text-xl font-medium text-[#a9acb0] line-through">₹12,999</span>
                <span className={`${heading} text-[48px] font-extrabold leading-none tracking-[-1px] text-brand-gold`}>₹2,999</span>
              </div>
              <p className="mb-6 text-[13px] font-medium text-[#c9cbce]">Inclusive of GST · introductory offer</p>
              <p className="mb-3.5 text-sm font-bold text-brand-gold-light">Everything in CET Basic, plus:</p>
              <ul className="mb-[26px] flex flex-1 list-none flex-col gap-3 p-0">
                {PLUS_LIST.map((item, i) => (
                  <li key={i} className="flex gap-[11px] text-[15px] leading-[1.5] text-[#e6e7e8]">
                    <Check className="mt-[1px]" />
                    <span>
                      {item.bold && <strong className="font-bold text-white">{item.bold}</strong>}
                      {item.text}
                    </span>
                  </li>
                ))}
              </ul>
              <a
                href="#register"
                data-plan="PLUS"
                className="flex min-h-[54px] items-center justify-center rounded-xl bg-brand-gold text-[15.5px] font-extrabold text-brand-navy no-underline transition-colors hover:bg-brand-gold-light"
              >
                Get CET Plus at ₹2,999
              </a>
            </div>
          </div>

          {/* Comparison */}
          <div className={`mt-10 overflow-hidden rounded-[18px] border ${LINE} bg-white shadow-[0_4px_18px_rgba(11,29,46,0.05)]`}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] border-collapse">
                <caption className={`${heading} px-6 pb-1 pt-5 text-left text-[18px] font-extrabold text-brand-navy`}>
                  Side-by-side comparison
                </caption>
                <thead>
                  <tr>
                    <th scope="col" className={`border-b ${LINE} px-6 py-4 text-left text-[13px] font-bold tracking-[0.6px] ${MUTED}`}>
                      WHAT YOU GET
                    </th>
                    <th scope="col" className={`w-[150px] border-b ${LINE} px-5 py-4 text-center text-[13px] font-bold tracking-[0.6px] ${MUTED}`}>
                      CET BASIC
                    </th>
                    <th scope="col" className="w-[150px] bg-brand-navy px-5 py-4 text-center text-[13px] font-bold tracking-[0.6px] text-brand-gold">
                      CET PLUS
                    </th>
                  </tr>
                </thead>
                <tbody className="[&>tr>*]:border-b [&>tr>*]:border-[#efe5e0]">
                  {COMPARE.map((row) => (
                    <tr key={row.label}>
                      <th scope="row" className="px-6 py-3.5 text-left text-[14.5px] font-normal text-[#333333]">
                        {row.label}
                      </th>
                      <CompareCell cell={row.basic} />
                      <CompareCell cell={row.plus} plus />
                    </tr>
                  ))}
                  <tr className="[&>*]:!border-b-0">
                    <th scope="row" className="px-6 py-4 text-left text-[14.5px] font-bold text-brand-navy">
                      Introductory price (first 200 students)
                    </th>
                    <td className={`${heading} px-5 py-4 text-center text-xl font-extrabold text-brand-navy`}>FREE</td>
                    <td className={`${heading} bg-[#fff4e3] px-5 py-4 text-center text-xl font-extrabold text-brand-navy`}>₹2,999</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* MOCK MATH */}
      <section
        className="w-full bg-brand-navy px-6 py-[72px]"
        style={{ backgroundImage: "radial-gradient(800px 360px at 50% -20%, rgba(244,176,39,0.16), transparent 65%)" }}
      >
        <div className={wrap}>
          <h2 className={`${heading} mb-3 text-center text-[28px] font-extrabold leading-[1.15] tracking-[-0.3px] text-white sm:text-[38px]`}>
            CET Plus: <span className="text-brand-gold">35 mocks</span> and 10 masterclasses before exam day
          </h2>
          <p className="mx-auto mb-11 max-w-[620px] text-center text-[16.5px] leading-[1.65] text-[#e6e7e8]">
            Scores move when practice is measured. Every mock is followed by analysis, and the masterclasses are taught by people who sat this exam and got into the colleges you are aiming for.
          </p>
          <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4 lg:gap-[18px]">
            {MOCK_STATS.map((s) => (
              <div key={s.title} className="rounded-[18px] border border-white/10 border-t-brand-gold bg-white/[0.05] p-5 text-center sm:p-[26px] [border-top-width:3px]">
                <div className={`${heading} text-[42px] font-extrabold leading-none tracking-[-1px] text-brand-gold sm:text-[52px]`}>{s.big}</div>
                <div className="mt-3 text-sm font-semibold text-white sm:text-[15px]">{s.title}</div>
                <div className="mt-[5px] text-[13px] text-[#c9cbce]">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="w-full bg-white px-6 py-20">
        <div className={wrap}>
          <p className={eyebrow}>HOW IT WORKS</p>
          <h2 className={`${h2} mb-11 text-[30px] leading-[1.15] sm:text-[40px]`}>From this form to your admission letter</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, i) => (
              <div key={step.title} className={`relative flex gap-4 rounded-[18px] border ${LINE} bg-[#f6f0ec] p-5 sm:block sm:p-6`}>
                <div className={`${heading} flex h-11 w-11 flex-none items-center justify-center rounded-full bg-brand-navy text-lg font-extrabold text-brand-gold sm:mb-4`}>
                  {i + 1}
                </div>
                <div className="min-w-0">
                  <h3 className={`${heading} mb-1.5 text-lg font-extrabold text-brand-navy sm:mb-2`}>{step.title}</h3>
                  <p className={`text-[14.5px] leading-[1.65] ${BODY}`}>{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY US */}
      <section className="w-full bg-[#f6f0ec] px-6 py-20">
        <div className={`${wrap} flex flex-wrap gap-12`}>
          <div className="min-w-0 flex-[1_1_440px]">
            <p className={eyebrow}>WHY MBA PROF</p>
            <h2 className={`${h2} mb-8 text-[30px] leading-[1.18] sm:text-[38px]`}>
              A percentile is not an outcome. We train for both.
            </h2>
            {WHY.map((w) => (
              <div key={w.title} className="mb-6 flex gap-4 last:mb-0">
                <Check size={26} className="mt-0.5" />
                <div>
                  <h3 className={`${heading} mb-1.5 text-[18px] font-extrabold text-brand-navy`}>{w.title}</h3>
                  <p className={`text-[15px] leading-[1.65] ${BODY}`}>{w.body}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex min-w-0 flex-[1_1_360px] flex-col gap-4">
            {QUOTES.map((q) => (
              <blockquote
                key={q.who}
                className={`relative m-0 overflow-hidden rounded-[18px] border ${LINE} border-l-4 border-l-brand-gold bg-white p-6 shadow-[0_4px_18px_rgba(11,29,46,0.05)]`}
              >
                <span aria-hidden="true" className={`${heading} absolute right-5 top-1 text-[72px] leading-none text-brand-gold/30`}>
                  &ldquo;
                </span>
                <p className="relative mb-4 pr-8 text-[15.5px] leading-[1.7] text-[#333333]">{q.quote}</p>
                <footer className="text-sm font-semibold text-brand-navy">
                  {q.who}
                  <span className={`mt-[3px] block text-[13px] font-normal ${MUTED}`}>{q.role}</span>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="w-full bg-white px-6 py-20">
        <div className="mx-auto max-w-[820px]">
          <p className={`${eyebrow} justify-center`}>FAQ</p>
          <h2 className={`${h2} mb-10 text-center text-[30px] leading-[1.15] sm:text-[38px]`}>
            Questions students ask before registering
          </h2>
          <div className="flex flex-col gap-3">
            {FAQ.map((item, i) => (
              <details
                key={item.q}
                open={i === 0}
                className={`group rounded-2xl border ${LINE} bg-[#f6f0ec] px-5 transition-colors open:border-brand-gold/60 open:bg-white`}
              >
                <summary className="flex min-h-[56px] cursor-pointer list-none items-center justify-between gap-4 py-3 [&::-webkit-details-marker]:hidden">
                  <h3 className={`${heading} text-[17.5px] font-extrabold text-brand-navy`}>{item.q}</h3>
                  <span
                    aria-hidden="true"
                    className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-brand-navy text-lg font-bold leading-none text-brand-gold transition-transform duration-200 group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className={`pb-5 pr-9 text-[15.5px] leading-[1.7] ${BODY}`}>{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section
        className="w-full bg-brand-navy px-6 py-[72px]"
        style={{ backgroundImage: "radial-gradient(700px 340px at 50% 120%, rgba(244,176,39,0.28), transparent 65%)" }}
      >
        <div className="mx-auto max-w-[780px] text-center">
          <h2 className={`${heading} mb-4 text-[30px] font-extrabold leading-[1.15] tracking-[-0.3px] text-white sm:text-[40px]`}>
            Batch starts 14 November. <span className="text-brand-gold">200 seats</span>, then prices go back up.
          </h2>
          <p className="mb-8 text-[17px] leading-[1.65] text-[#e6e7e8]">
            CET Basic at ₹0 instead of ₹9,999. CET Plus at ₹2,999 instead of ₹12,999. Hold your seat before the counter runs out.
          </p>
          <div className="flex flex-wrap justify-center gap-3.5">
            <a
              href="#register"
              className="inline-flex min-h-[56px] items-center justify-center rounded-xl bg-brand-gold px-8 text-base font-extrabold text-brand-navy no-underline transition-colors hover:bg-brand-gold-light"
            >
              Claim my introductory seat
            </a>
            <a
              href={TEL}
              className="inline-flex min-h-[56px] items-center justify-center rounded-xl border-2 border-white/40 px-8 text-base font-bold text-white no-underline transition-colors hover:bg-white/10"
            >
              Talk to a counsellor
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="w-full border-t border-brand-gold/30 bg-brand-navy px-6 pb-28 pt-12 lg:pb-8">
        <div className={wrap}>
          <div className="flex flex-wrap justify-between gap-8 border-b border-white/10 pb-8">
            <div className="min-w-0 flex-[1_1_280px]">
              <Image
                src="/logo-white.png"
                alt="MBA Prof"
                width={1794}
                height={372}
                sizes="220px"
                className="mb-3.5 h-10 w-auto"
              />
              <p className={`${LABEL} max-w-[320px] text-sm font-normal leading-[1.65] text-[#a9acb0]`}>
                India&apos;s most affordable MBA entrance learning platform.
              </p>
            </div>
            <div className="min-w-0 flex-[1_1_240px]">
              <div className="mb-3 text-[13px] font-bold tracking-[0.8px] text-brand-gold">GET IN TOUCH</div>
              <p className="mb-2 text-sm leading-[1.65] text-[#a9acb0]">
                1st Floor, Plot No. 149, Sector 12, Juhu Nagar Road, Vashi, Navi Mumbai 400703
              </p>
              <p className="text-sm leading-[1.9] text-[#a9acb0]">
                <a href="mailto:info@mbaprof.in" className="text-[#a9acb0] no-underline hover:text-white">
                  info@mbaprof.in
                </a>
                <br />
                <a href={TEL} className="text-[#a9acb0] no-underline hover:text-white">
                  {PHONE}
                </a>{" "}
                ·{" "}
                <a href="tel:+918291181713" className="text-[#a9acb0] no-underline hover:text-white">
                  +91 82911 81713
                </a>
              </p>
            </div>
            <div className="min-w-0 flex-[0_1_220px]">
              <div className="mb-3 text-[13px] font-bold tracking-[0.8px] text-brand-gold">PROGRAM</div>
              <p className="text-sm leading-[1.9] text-[#a9acb0]">
                CET Basic — free for first 200
                <br />
                CET Plus — ₹2,999 incl. GST
              </p>
            </div>
          </div>
          <p className="mt-6 text-[12.5px] leading-[1.7] text-[#9a9da1]">
            CET 2027 refers to the MH-CET (MBA/MMS) entrance examination. MBA Prof is an independent training and admission consulting provider and is not affiliated with the State Common Entrance Test Cell, Government of Maharashtra. Introductory pricing is limited to the first 200 registrations and may be withdrawn at any time. © 2026 MBA Prof. All rights reserved.
          </p>
        </div>
      </footer>

      <StickyCta />
    </>
  );
}
