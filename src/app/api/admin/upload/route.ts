import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/admin";

const ALLOWED_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
};
const MAX_SIZE_BYTES = 5 * 1024 * 1024;
const BUCKET = "uploads";

// Base URL of the Supabase project: SUPABASE_URL if set, otherwise derived
// from the project ref embedded in the pooled database user name
// (postgres.<ref>).
function supabaseUrl() {
  if (process.env.SUPABASE_URL) return process.env.SUPABASE_URL.replace(/\/$/, "");
  const match = /postgres(?:ql)?:\/\/postgres\.([a-z0-9]+):/.exec(
    process.env.DATABASE_URL ?? ""
  );
  return match ? `https://${match[1]}.supabase.co` : null;
}

export async function POST(request: Request) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const extension = ALLOWED_TYPES[file.type];
  if (!extension) {
    return NextResponse.json(
      { error: "Only PNG, JPEG, WEBP or GIF images are allowed" },
      { status: 400 }
    );
  }
  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json(
      { error: "Image must be smaller than 5MB" },
      { status: 400 }
    );
  }

  const base = supabaseUrl();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!base || !key) {
    return NextResponse.json(
      { error: "Image storage is not configured on the server yet" },
      { status: 500 }
    );
  }

  const filename = `${randomUUID()}.${extension}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  try {
    const res = await fetch(`${base}/storage/v1/object/${BUCKET}/${filename}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        apikey: key,
        "content-type": file.type,
      },
      body: bytes,
    });
    if (!res.ok) {
      console.error("Supabase Storage upload failed:", res.status, await res.text());
      return NextResponse.json(
        { error: "Failed to store the uploaded image" },
        { status: 500 }
      );
    }
    return NextResponse.json({
      url: `${base}/storage/v1/object/public/${BUCKET}/${filename}`,
    });
  } catch (err) {
    console.error("Image upload failed:", err);
    return NextResponse.json(
      { error: "Failed to store the uploaded image" },
      { status: 500 }
    );
  }
}
