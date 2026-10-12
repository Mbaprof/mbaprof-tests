import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

import { ProfileForm } from "./profile-form";

export default async function StudentProfilePage() {
  const session = await auth();
  const studentId = session!.user.id;

  const student = await prisma.user.findUnique({
    where: { id: studentId },
    select: {
      name: true,
      email: true,
      phone: true,
      college: true,
      course: true,
      targetExam: true,
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-navy">Edit profile</h1>
      <p className="mt-1 text-sm text-brand-ink/60">
        Keep your details up to date - your target exam controls which tests you see.
      </p>

      <div className="mt-8 max-w-lg rounded-xl border border-black/5 bg-white p-6">
        <ProfileForm
          initial={{
            name: student?.name ?? "",
            email: student?.email ?? "",
            phone: student?.phone ?? "",
            college: student?.college ?? "",
            course: student?.course ?? "",
            targetExam: student?.targetExam ?? "",
          }}
        />
      </div>
    </div>
  );
}
