import { createHmac, timingSafeEqual } from "node:crypto";

// Zoom signs every webhook it sends. We check that signature before trusting
// anything in the body, and answer Zoom's one-off URL validation challenge.

const MAX_AGE_SECONDS = 5 * 60;

const hmacHex = (secret: string, message: string) =>
  createHmac("sha256", secret).update(message).digest("hex");

// Zoom's "endpoint.url_validation" handshake: reply with the plain token and
// its HMAC-SHA256 under our secret token.
export function urlValidationResponse(secret: string, plainToken: string) {
  return { plainToken, encryptedToken: hmacHex(secret, plainToken) };
}

// Signature header is "v0=<hex>" over "v0:<timestamp>:<raw body>".
export function verifyZoomSignature(args: {
  secret: string;
  timestamp: string | null;
  signature: string | null;
  rawBody: string;
  nowMs?: number;
}) {
  const { secret, timestamp, signature, rawBody } = args;
  if (!secret || !timestamp || !signature) return false;

  const ts = Number(timestamp);
  if (!Number.isFinite(ts)) return false;
  const nowSeconds = (args.nowMs ?? Date.now()) / 1000;
  if (Math.abs(nowSeconds - ts) > MAX_AGE_SECONDS) return false;

  const expected = `v0=${hmacHex(secret, `v0:${timestamp}:${rawBody}`)}`;
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && timingSafeEqual(a, b);
}

// The numeric meeting id inside a Zoom join link (".../j/81234567890?pwd=...").
export function meetingIdFromJoinUrl(url: string | null | undefined) {
  if (!url) return null;
  const match = /\/(?:j|w|s)\/(\d{8,12})/.exec(url);
  return match ? match[1] : null;
}

export type RecordingCompleted = {
  meetingId: string;
  uuid: string;
  topic: string | null;
  startTime: Date;
  durationMinutes: number | null;
  shareUrl: string;
  passcode: string | null;
};

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

const text = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : null);

// Pulls what we need out of a "recording.completed" event. Zoom's payload has
// changed over time, so everything is read defensively; returns null when the
// event is not usable (missing id, time or link).
export function parseRecordingCompleted(body: unknown): RecordingCompleted | null {
  if (!isObject(body) || body.event !== "recording.completed") return null;
  const payload = isObject(body.payload) ? body.payload : null;
  const object = payload && isObject(payload.object) ? payload.object : null;
  if (!object) return null;

  const meetingId = object.id !== undefined && object.id !== null ? String(object.id).replace(/\s/g, "") : "";
  const uuid = text(object.uuid);
  const start = text(object.start_time);
  if (!meetingId || !uuid || !start) return null;
  const startTime = new Date(start);
  if (Number.isNaN(startTime.getTime())) return null;

  // Prefer the shareable page; fall back to the first recording file's play link.
  let shareUrl = text(object.share_url);
  const files = Array.isArray(object.recording_files) ? object.recording_files.filter(isObject) : [];
  if (!shareUrl) {
    const playable = files.find((f) => text(f.play_url));
    shareUrl = playable ? text(playable.play_url) : null;
  }
  if (!shareUrl || !/^https:\/\//i.test(shareUrl)) return null;

  const passcode = text(object.recording_play_passcode) ?? text(object.password);
  const duration = Number(object.duration);

  return {
    meetingId,
    uuid,
    topic: text(object.topic),
    startTime,
    durationMinutes: Number.isFinite(duration) && duration > 0 ? Math.round(duration) : null,
    shareUrl,
    passcode,
  };
}
