import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validation";
import { sendNewStudentNotification } from "@/lib/email";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const { name, email, password, phone, college, course, targetExam } =
    parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "An account with this email already exists" },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);

  // Public registration always creates a STUDENT account — admin accounts are
  // seeded separately (`npm run db:seed`) and never created via this endpoint.
  await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: "STUDENT",
      phone,
      college,
      course,
      targetExam,
    },
  });

  await sendNewStudentNotification({ name, email, phone, college, course, targetExam });

  return NextResponse.json({ ok: true });
}
