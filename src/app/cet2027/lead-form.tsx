"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { LEAD_STATUSES, normalizePhone } from "@/lib/leads";

type Plan = "BASIC" | "PLUS";
type Tracking = Partial<
  Record<
    "utmSource" | "utmMedium" | "utmCampaign" | "utmContent" | "utmTerm" | "fbclid" | "gclid" | "referrer",
    string
  >
>;

const field =
  "w-full rounded-[10px] border border-[#d9d2bd] bg-white px-3.5 text-base font-medium text-[#0b1d2e] placeholder:text-[#a3afbc] focus:border-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-gold/50";
const label = "mb-1.5 block text-[13px] font-semibold text-[#3c4b5c]";
const errorText = "mt-1.5 text-[13px] font-medium text-[#B91C1C]";

// The "Book your introductory seat" form. Sends the sign-up to our own server,
// remembers which ad it came from (utm_* and click ids in the address), then
// moves the visitor to the thank-you page.
export function LeadForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [currentStatus, setCurrentStatus] = useState<string>(LEAD_STATUSES[0]);
  const [plan, setPlan] = useState<Plan>("BASIC");
  const [consent, setConsent] = useState(true);
  const [website, setWebsite] = useState(""); // honeypot
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const tracking = useRef<Tracking>({});

  // Remember where the visitor came from the moment they land.
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const get = (k: string) => p.get(k)?.slice(0, 300) || undefined;
    tracking.current = {
      utmSource: get("utm_source"),
      utmMedium: get("utm_medium"),
      utmCampaign: get("utm_campaign"),
      utmContent: get("utm_content"),
      utmTerm: get("utm_term"),
      fbclid: get("fbclid"),
      gclid: get("gclid"),
      referrer: document.referrer ? document.referrer.slice(0, 300) : undefined,
    };
  }, []);

  // "Claim CET Basic free" / "Get CET Plus" buttons elsewhere on the page
  // pre-select that program in this form.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest<HTMLElement>("[data-plan]");
      const chosen = el?.dataset.plan;
      if (chosen === "BASIC" || chosen === "PLUS") setPlan(chosen);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  function validate() {
    const next: Record<string, string> = {};
    if (name.trim().length < 2) next.name = "Please enter your name";
    if (!normalizePhone(phone)) next.phone = "Enter a valid 10-digit mobile number";
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      next.email = "Enter a valid email address";
    }
    if (!consent) next.consent = "Please tick the box so we can contact you";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!validate()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/cet2027/lead", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          email: email.trim() || undefined,
          city: city.trim() || undefined,
          currentStatus,
          plan,
          consent,
          website,
          ...tracking.current,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        ref?: string;
        error?: string;
        fields?: Record<string, string>;
      };
      if (!res.ok || !data.ok) {
        if (data.fields) setErrors(data.fields);
        setFormError(data.error ?? "Something went wrong. Please try again, or call us.");
        setSubmitting(false);
        return;
      }
      const params = new URLSearchParams({ ref: data.ref ?? "", plan: plan.toLowerCase() });
      router.push(`/cet2027/thank-you?${params.toString()}`);
    } catch {
      setFormError("We couldn't reach the server. Please check your connection and try again.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate>
      {formError && (
        <p
          role="alert"
          className="mb-4 rounded-[10px] bg-[#FEF2F2] px-3.5 py-3 text-sm font-medium text-[#B91C1C]"
        >
          {formError}
        </p>
      )}

      <div className="mb-3.5">
        <label htmlFor="f-name" className={label}>
          Full name
        </label>
        <input
          id="f-name"
          name="name"
          type="text"
          autoComplete="name"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={`${field} h-12`}
          aria-invalid={Boolean(errors.name)}
        />
        {errors.name && <p className={errorText}>{errors.name}</p>}
      </div>

      <div className="mb-3.5">
        <label htmlFor="f-phone" className={label}>
          WhatsApp number
        </label>
        <div className="flex items-stretch overflow-hidden rounded-[10px] border border-[#d9d2bd] bg-white focus-within:border-brand-navy focus-within:ring-2 focus-within:ring-brand-gold/50">
          <span className="flex items-center border-r border-[#d9d2bd] bg-brand-cream px-3 text-[15px] font-semibold text-[#4a5a6b]">
            +91
          </span>
          <input
            id="f-phone"
            name="phone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            placeholder="10-digit mobile"
            maxLength={14}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="h-[46px] min-w-0 flex-1 border-0 bg-transparent px-3.5 text-base font-medium text-[#0b1d2e] placeholder:text-[#a3afbc] focus:outline-none"
            aria-invalid={Boolean(errors.phone)}
          />
        </div>
        {errors.phone && <p className={errorText}>{errors.phone}</p>}
      </div>

      <div className="mb-3.5 flex flex-wrap gap-3.5">
        <div className="min-w-0 flex-[1_1_170px]">
          <label htmlFor="f-email" className={label}>
            Email
          </label>
          <input
            id="f-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`${field} h-12`}
            aria-invalid={Boolean(errors.email)}
          />
          {errors.email && <p className={errorText}>{errors.email}</p>}
        </div>
        <div className="min-w-0 flex-[1_1_140px]">
          <label htmlFor="f-city" className={label}>
            City
          </label>
          <input
            id="f-city"
            name="city"
            type="text"
            autoComplete="address-level2"
            placeholder="Mumbai"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className={`${field} h-12`}
          />
        </div>
      </div>

      <div className="mb-[18px]">
        <label htmlFor="f-status" className={label}>
          Current status
        </label>
        <select
          id="f-status"
          name="status"
          value={currentStatus}
          onChange={(e) => setCurrentStatus(e.target.value)}
          className={`${field} h-12 px-3`}
        >
          {LEAD_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <fieldset className="mb-[18px] border-0 p-0">
        <legend className="mb-2 p-0 text-[13px] font-semibold text-[#3c4b5c]">
          Choose your program
        </legend>
        <label
          htmlFor="p-basic"
          className="mb-[9px] flex min-h-11 cursor-pointer items-center gap-[11px] rounded-[10px] border border-[#d9d2bd] px-3.5 py-[13px] has-[:checked]:border-brand-gold has-[:checked]:bg-[#fff8e6]"
        >
          <input
            id="p-basic"
            type="radio"
            name="plan"
            checked={plan === "BASIC"}
            onChange={() => setPlan("BASIC")}
            className="h-[18px] w-[18px] flex-none accent-[#0b1d2e]"
          />
          <span className="text-sm font-semibold text-[#0b1d2e]">CET Basic</span>
          <span className="ml-auto text-sm font-bold text-[#8a5a00]">FREE</span>
        </label>
        <label
          htmlFor="p-plus"
          className="flex min-h-11 cursor-pointer items-center gap-[11px] rounded-[10px] border border-[#d9d2bd] px-3.5 py-[13px] has-[:checked]:border-brand-gold has-[:checked]:bg-[#fff8e6]"
        >
          <input
            id="p-plus"
            type="radio"
            name="plan"
            checked={plan === "PLUS"}
            onChange={() => setPlan("PLUS")}
            className="h-[18px] w-[18px] flex-none accent-[#0b1d2e]"
          />
          <span className="text-sm font-semibold text-[#0b1d2e]">CET Plus</span>
          <span className="ml-auto text-sm font-bold text-[#0b1d2e]">₹2,999</span>
        </label>
      </fieldset>

      <label htmlFor="f-consent" className="mb-[18px] flex cursor-pointer items-start gap-2.5">
        <input
          id="f-consent"
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5 h-[17px] w-[17px] flex-none accent-[#0b1d2e]"
        />
        <span className="text-[12.5px] leading-normal text-[#66768a]">
          I agree to receive calls and WhatsApp updates from MBA Prof about CET 2027.
        </span>
      </label>
      {errors.consent && <p className={`${errorText} -mt-3.5 mb-4`}>{errors.consent}</p>}

      {/* Honeypot: hidden from people, irresistible to bots. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="f-website">Website</label>
        <input
          id="f-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="flex min-h-[54px] w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand-gold text-base font-extrabold text-brand-navy transition-colors hover:bg-brand-gold-light disabled:cursor-wait disabled:opacity-70"
      >
        {submitting ? "Reserving your seat..." : "Claim my seat"}
        {!submitting && (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0b1d2e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        )}
      </button>
    </form>
  );
}
