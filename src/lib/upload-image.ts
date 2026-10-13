// Browser helper used by the test editor: uploads one image through the
// admin-only /api/admin/upload route and returns its public URL.
export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error ?? "Failed to upload image");
  }

  return data.url as string;
}
