import { z } from "zod";

// Shared (browser + server) pieces for campaign sign-ups: validation, phone
// cleanup, stage labels. Nothing here touches the database.

export const CAMPAIGN_CET2027 = "cet2027";

export const LEAD_STATUSES = [
  "Final-year student",
  "Graduate",
  "Working professional",
] as const;

export const LEAD_PLANS = [
  { value: "BASIC", label: "CET Basic" },
  { value: "PLUS", label: "CET Plus" },
] as const;

export const LEAD_STAGES = [
  { value: "NEW", label: "New", tone: "bg-blue-100 text-blue-700" },
  { value: "CONTACTED", label: "Contacted", tone: "bg-amber-100 text-amber-700" },
  { value: "ENROLLED", label: "Enrolled", tone: "bg-green-100 text-green-700" },
  { value: "NOT_INTERESTED", label: "Not interested", tone: "bg-black/5 text-brand-ink/60" },
] as const;

export type LeadStage = (typeof LEAD_STAGES)[number]["value"];

export const isLeadStage = (v: string): v is LeadStage =>
  LEAD_STAGES.some((s) => s.value === v);

export const stageLabel = (v: string) => LEAD_STAGES.find((s) => s.value === v)?.label ?? v;
export const planLabel = (v: string) => LEAD_PLANS.find((p) => p.value === v)?.label ?? v;

// Accepts what people actually type: "98765 43210", "+91 98765-43210",
// "09876543210", "919876543210". Returns the 10-digit Indian mobile number,
// or null if it does not look like one.
export function normalizePhone(input: string | null | undefined) {
  if (!input) return null;
  let digits = input.replace(/\D/g, "");
  if (digits.startsWith("0091")) digits = digits.slice(4);
  else if (digits.startsWith("91") && digits.length === 12) digits = digits.slice(2);
  else if (digits.startsWith("0") && digits.length === 11) digits = digits.slice(1);
  return /^[6-9]\d{9}$/.test(digits) ? digits : null;
}

export function formatPhone(tenDigits: string) {
  return `+91 ${tenDigits.slice(0, 5)} ${tenDigits.slice(5)}`;
}

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v ? v : undefined));

export const leadSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(80, "That name is too long"),
  phone: z
    .string()
    .trim()
    .refine((v) => normalizePhone(v) !== null, "Enter a valid 10-digit mobile number"),
  email: z
    .string()
    .trim()
    .max(120)
    .optional()
    .refine((v) => !v || z.string().email().safeParse(v).success, "Enter a valid email address")
    .transform((v) => (v ? v.toLowerCase() : undefined)),
  city: optionalText(60),
  currentStatus: z.enum(LEAD_STATUSES).optional(),
  plan: z.enum(["BASIC", "PLUS"]),
  consent: z.literal(true, { message: "Please tick the box so we can contact you" }),
  // Where the visitor came from (read from the page address by the form).
  utmSource: optionalText(120),
  utmMedium: optionalText(120),
  utmCampaign: optionalText(160),
  utmContent: optionalText(160),
  utmTerm: optionalText(160),
  fbclid: optionalText(300),
  gclid: optionalText(300),
  referrer: optionalText(300),
  // Honeypot: real people never see or fill this.
  website: z.string().optional(),
});

export type LeadInput = z.input<typeof leadSchema>;
export type LeadData = z.output<typeof leadSchema>;
