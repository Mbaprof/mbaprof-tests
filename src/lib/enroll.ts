import { randomInt } from "node:crypto";
import { z } from "zod";

import { LEAD_STATUSES, normalizePhone } from "@/lib/leads";
import { prisma } from "@/lib/prisma";

// Server-only: enrollment from the CET 2027 enroll page (a standalone HTML page
// on mbaprof.in that posts here). CET Basic with the code creates a student
// account at once; CET Plus is saved as a lead for a counsellor to call.

// Always on. The page tells students it is for the first 200, but there is no
// usage limit here on purpose.
export const ENROLL_CODE = "FIRST200";

export const ENROLL_BATCH_SETTING = "enroll.cetBasicBatchId";

// Sites allowed to post to /api/enroll from a browser. ENROLL_ALLOWED_ORIGINS
// (comma-separated) adds more, e.g. a staging copy of the page.
export function allowedOrigins() {
  const extra = (process.env.ENROLL_ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((o) => o.trim().replace(/\/$/, ""))
    .filter(Boolean);
  return ["https://mbaprof.in", "https://www.mbaprof.in", ...extra];
}

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v ? v : undefined));

// Field names match what the enroll page sends.
export const enrollSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name.").max(80, "That name is too long."),
  phone: z
    .string()
    .trim()
    .refine((v) => normalizePhone(v) !== null, "Enter a 10-digit Indian mobile number."),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .max(120)
    .pipe(z.email("Enter a valid email address. It becomes your login ID.")),
  city: optionalText(60),
  status: z.enum(LEAD_STATUSES).optional(),
  plan: z.enum(["BASIC", "PLUS"]),
  code: optionalText(20).transform((v) => v?.toUpperCase()),
  consent: z.literal(true, { message: "Tick the box so we can send your class updates on WhatsApp." }),
});

export type EnrollData = z.output<typeof enrollSchema>;

export const codeIsValid = (code: string | undefined) => code === ENROLL_CODE;

// Easy to read out or type from a phone screen: no 0/O/1/I/L.
const PASSWORD_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

export function newPassword() {
  let out = "";
  for (let i = 0; i < 8; i++) out += PASSWORD_ALPHABET[randomInt(PASSWORD_ALPHABET.length)];
  return `Cet7-${out.slice(0, 4)}-${out.slice(4)}`;
}

// The batch new CET Basic students join, or null if none is set (or it was
// deleted / switched off). Students without a batch can still log in; an
// admin places them later.
export async function enrollBatch() {
  const setting = await prisma.setting.findUnique({ where: { key: ENROLL_BATCH_SETTING } });
  if (!setting) return null;
  return prisma.batch.findFirst({
    where: { id: setting.value, active: true },
    select: { id: true, name: true },
  });
}
