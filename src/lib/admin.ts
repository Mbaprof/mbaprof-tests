import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// Admin-only pages and routes call this. The role is read from the database
// (not just the login token) so a promotion or demotion takes effect at once.
export async function getAdminSession() {
  const session = await auth();
  if (!session?.user) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  return user?.role === "ADMIN" ? session : null;
}

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const admin = await getAdminSession();
  if (!admin) redirect("/student");
  return admin;
}

export const istDate = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
  timeZone: "Asia/Kolkata",
});

export const istDateTime = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Kolkata",
});
