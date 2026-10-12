"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { profileSchema } from "@/lib/validation";

export type ProfileState = { error?: string; success?: boolean } | undefined;

export async function updateProfile(
  _prevState: ProfileState,
  formData: FormData
): Promise<ProfileState> {
  const session = await auth();
  if (!session?.user) {
    return { error: "You must be signed in to update your profile." };
  }

  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    college: formData.get("college"),
    course: formData.get("course"),
    targetExam: formData.get("targetExam"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: parsed.data,
  });

  revalidatePath("/student");
  revalidatePath("/student/profile");

  return { success: true };
}
