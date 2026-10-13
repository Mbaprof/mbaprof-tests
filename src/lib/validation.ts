import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const MBA_ENTRANCE_EXAMS = [
  "MH-CET (MBA)",
  "CAT",
  "MAT",
  "ATMA",
  "Other",
] as const;

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone: z
    .string()
    .trim()
    .min(10, "Enter a valid contact number")
    .max(15, "Enter a valid contact number")
    .regex(/^[0-9+\-\s]+$/, "Enter a valid contact number"),
  college: z.string().trim().min(2, "College name is required"),
  course: z.string().trim().min(2, "Course is required"),
  targetExam: z.enum(MBA_ENTRANCE_EXAMS, {
    message: "Select an MBA entrance exam",
  }),
});

export const profileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  phone: z
    .string()
    .trim()
    .min(10, "Enter a valid contact number")
    .max(15, "Enter a valid contact number")
    .regex(/^[0-9+\-\s]+$/, "Enter a valid contact number"),
  college: z.string().trim().min(2, "College name is required"),
  course: z.string().trim().min(2, "Course is required"),
  targetExam: z.enum(MBA_ENTRANCE_EXAMS, {
    message: "Select an MBA entrance exam",
  }),
});

export const optionSchema = z.object({
  id: z.string().optional(),
  text: z.string().trim().min(1, "Option text is required"),
  imageUrl: z.string().trim().optional(),
  isCorrect: z.boolean(),
});

export const questionSchema = z.object({
  id: z.string().optional(),
  text: z.string().trim().min(1, "Question text is required"),
  imageUrl: z.string().trim().optional(),
  explanation: z.string().trim().optional(),
  marks: z.coerce.number().int().min(1).max(100),
  options: z
    .array(optionSchema)
    .min(2, "At least 2 options are required")
    .max(6, "At most 6 options are allowed")
    .refine((opts) => opts.filter((o) => o.isCorrect).length === 1, {
      message: "Exactly one option must be marked correct",
    }),
});

// A section's content is an ordered list of blocks — a standalone question,
// or a passage shared by several sub-questions (e.g. a reading passage or a
// cloze paragraph).
export const passageGroupSchema = z.object({
  id: z.string().optional(),
  passageTitle: z.string().trim().optional(),
  passageText: z.string().trim().min(1, "Passage text is required"),
  questions: z.array(questionSchema).min(1, "Add at least one question"),
});

export const sectionBlockSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("question"), question: questionSchema }),
  z.object({ kind: z.literal("passage"), passage: passageGroupSchema }),
]);

export const sectionSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1, "Section name is required"),
  blocks: z.array(sectionBlockSchema).min(1, "Add at least one question"),
});

export const testSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters"),
  description: z.string().trim().optional(),
  targetExam: z.enum(MBA_ENTRANCE_EXAMS, {
    message: "Select which entrance exam this test is for",
  }),
  durationMinutes: z.coerce.number().int().min(1).max(600),
  isFreePreview: z.boolean().default(false),
  sections: z.array(sectionSchema).min(1, "Add at least one section"),
});

export type TestInput = z.infer<typeof testSchema>;
export type QuestionInput = z.infer<typeof questionSchema>;

// The four top-level mock sections the question bank and generator key off
// of — kept separate from a materialized Test's free-text Section.name, but
// the generator names generated sections identically to these.
export const BANK_SECTIONS = [
  "Logical Reasoning",
  "Abstract Reasoning",
  "Quantitative Aptitude",
  "Verbal Ability & RC",
] as const;

export const DIFFICULTY_LEVELS = ["EASY", "MODERATE", "DIFFICULT"] as const;

// The default CET-level mix every generated mock uses for now (Foundation/
// Advanced tiers can be added later without changing this shape).
export const CET_DIFFICULTY_MIX = { EASY: 0.25, MODERATE: 0.5, DIFFICULT: 0.25 } as const;

export const bankOptionSchema = z.object({
  text: z.string().trim().min(1, "Option text is required"),
  imageUrl: z.string().trim().optional(),
  isCorrect: z.boolean(),
});

export const bankQuestionSchema = z.object({
  section: z.enum(BANK_SECTIONS, { message: "Select a section" }),
  topic: z.string().trim().min(1, "Topic is required"),
  subTopic: z.string().trim().optional(),
  difficulty: z.enum(DIFFICULTY_LEVELS, { message: "Select a difficulty" }),
  estimatedTimeSeconds: z.coerce.number().int().min(10).max(900).default(60),
  conceptTested: z.string().trim().optional(),
  tags: z.array(z.string().trim().min(1)).default([]),
  text: z.string().trim().min(1, "Question text is required"),
  imageUrl: z.string().trim().optional(),
  explanation: z.string().trim().optional(),
  marks: z.coerce.number().int().min(1).max(100).default(1),
  options: z
    .array(bankOptionSchema)
    .min(2, "At least 2 options are required")
    .max(6, "At most 6 options are allowed")
    .refine((opts) => opts.filter((o) => o.isCorrect).length === 1, {
      message: "Exactly one option must be marked correct",
    }),
});

// A generator-time group: a shared stimulus plus the bank questions written
// against it (an arrangement puzzle, a DI dataset, a reading passage, ...).
export const bankQuestionSetSchema = z.object({
  title: z.string().trim().optional(),
  stimulus: z.string().trim().min(1, "Stimulus text is required"),
  imageUrl: z.string().trim().optional(),
  questions: z.array(bankQuestionSchema).min(1, "Add at least one question"),
});

export type BankQuestionInput = z.infer<typeof bankQuestionSchema>;
export type BankQuestionSetInput = z.infer<typeof bankQuestionSetSchema>;

export const generateMockSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters"),
  targetExam: z.enum(MBA_ENTRANCE_EXAMS, {
    message: "Select which entrance exam this mock is for",
  }),
  durationMinutes: z.coerce.number().int().min(1).max(600),
  published: z.boolean().default(false),
  isFreePreview: z.boolean().default(false),
  sectionCounts: z.object({
    "Logical Reasoning": z.coerce.number().int().min(0).max(400),
    "Abstract Reasoning": z.coerce.number().int().min(0).max(400),
    "Quantitative Aptitude": z.coerce.number().int().min(0).max(400),
    "Verbal Ability & RC": z.coerce.number().int().min(0).max(400),
  }),
});

export type GenerateMockInput = z.infer<typeof generateMockSchema>;
