// The Meta pixel id is placed inside a script tag, so only accept digits.
// Set META_PIXEL_ID in the server environment to turn the pixel on.
export function metaPixelId() {
  const raw = process.env.META_PIXEL_ID;
  return raw && /^\d{5,20}$/.test(raw.trim()) ? raw.trim() : null;
}
