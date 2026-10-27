"use server";

import { revalidatePath } from "next/cache";

import { getAdminSession } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export type AccountPreview = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  college: string | null;
  joined: string;
};

export type LookupResult =
  | { ok: true; account: AccountPreview }
  | { ok: false; message: string };

export type ChangeResult = { ok: true; message: string } | { ok: false; message: string };

const NOT_ALLOWED = "You are not allowed to do that.";

// Step 1 of making someone an admin: find the account by email and show who it is,
// so the admin can confirm it really is the right person before promoting it.
export async function findAccountForAdmin(email: string): Promise<LookupResult> {
  if (!(await getAdminSession())) return { ok: false, message: NOT_ALLOWED };

  const cleaned = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleaned)) {
    return { ok: false, message: "Enter a valid email address." };
  }

  const user = await prisma.user.findUnique({
    where: { email: cleaned },
    select: { id: true, name: true, email: true, phone: true, college: true, role: true, createdAt: true },
  });
  if (!user) {
    return {
      ok: false,
      message: "No account has that email. Ask them to register first at tests.mbaprof.in/register, then try again.",
    };
  }
  if (user.role === "ADMIN") {
    return { ok: false, message: `${user.name} is already an admin.` };
  }

  return {
    ok: true,
    account: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      college: user.college,
      joined: user.createdAt.toISOString(),
    },
  };
}

// Step 2: promote the confirmed account.
export async function promoteToAdmin(userId: string): Promise<ChangeResult> {
  if (!(await getAdminSession())) return { ok: false, message: NOT_ALLOWED };

  try {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { name: true, role: true } });
    if (!user) return { ok: false, message: "That account no longer exists." };
    if (user.role === "ADMIN") return { ok: false, message: `${user.name} is already an admin.` };

    await prisma.user.update({ where: { id: userId }, data: { role: "ADMIN" } });
    revalidatePath("/admin/admins");
    return { ok: true, message: `${user.name} is now an admin.` };
  } catch (error) {
    console.error("Failed to promote admin:", error);
    return { ok: false, message: "Something went wrong. Please try again." };
  }
}

// Takes admin access away (the account becomes a normal student account again).
// You cannot remove yourself, and the last remaining admin can never be removed,
// so the site can't be left without anyone able to manage it.
export async function removeAdmin(userId: string): Promise<ChangeResult> {
  const session = await getAdminSession();
  if (!session) return { ok: false, message: NOT_ALLOWED };
  if (session.user.id === userId) {
    return { ok: false, message: "You can't remove your own admin access. Ask another admin to do it." };
  }

  try {
    const target = await prisma.user.findUnique({ where: { id: userId }, select: { name: true, role: true } });
    if (!target || target.role !== "ADMIN") return { ok: false, message: "That person is not an admin." };

    const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
    if (adminCount <= 1) return { ok: false, message: "There must always be at least one admin." };

    await prisma.user.update({ where: { id: userId }, data: { role: "STUDENT" } });
    revalidatePath("/admin/admins");
    return { ok: true, message: `${target.name} is no longer an admin.` };
  } catch (error) {
    console.error("Failed to remove admin:", error);
    return { ok: false, message: "Something went wrong. Please try again." };
  }
}
