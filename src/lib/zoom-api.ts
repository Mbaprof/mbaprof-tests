// Minimal Zoom REST client for personal join links (meeting registrants).
// Uses a Server-to-Server OAuth app: a token is requested with the account's
// credentials, cached for most of its hour, and sent as a Bearer token.

const API_BASE = (process.env.ZOOM_API_BASE ?? "https://api.zoom.us/v2").replace(/\/$/, "");
const OAUTH_URL = process.env.ZOOM_OAUTH_URL ?? "https://zoom.us/oauth/token";

export function zoomApiConfigured() {
  return Boolean(
    process.env.ZOOM_ACCOUNT_ID && process.env.ZOOM_CLIENT_ID && process.env.ZOOM_CLIENT_SECRET
  );
}

export type ZoomErrorCode =
  | "not_configured"
  | "registration_off"
  | "meeting_not_found"
  | "rate_limited"
  | "auth_failed"
  | "zoom_error";

export type ZoomResult<T> =
  | ({ ok: true } & T)
  | { ok: false; code: ZoomErrorCode; message: string };

let cachedToken: { value: string; expiresAt: number } | null = null;

async function getToken(forceNew = false): Promise<ZoomResult<{ token: string }>> {
  if (!zoomApiConfigured()) {
    return { ok: false, code: "not_configured", message: "The Zoom connection is not set up on the server yet." };
  }
  if (!forceNew && cachedToken && cachedToken.expiresAt > Date.now()) {
    return { ok: true, token: cachedToken.value };
  }

  const basic = Buffer.from(
    `${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`
  ).toString("base64");
  try {
    const res = await fetch(OAUTH_URL, {
      method: "POST",
      headers: {
        Authorization: `Basic ${basic}`,
        "content-type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "account_credentials",
        account_id: process.env.ZOOM_ACCOUNT_ID as string,
      }),
      cache: "no-store",
    });
    const data = (await res.json().catch(() => ({}))) as {
      access_token?: string;
      expires_in?: number;
      reason?: string;
    };
    if (!res.ok || !data.access_token) {
      console.error("Zoom token request failed:", res.status, data.reason ?? "");
      return {
        ok: false,
        code: "auth_failed",
        message: "Zoom did not accept the saved credentials (check the Account ID, Client ID and Secret).",
      };
    }
    // Keep a minute of safety margin; tokens last an hour.
    cachedToken = {
      value: data.access_token,
      expiresAt: Date.now() + Math.max(60, (data.expires_in ?? 3600) - 60) * 1000,
    };
    return { ok: true, token: data.access_token };
  } catch (error) {
    console.error("Zoom token request error:", error);
    return { ok: false, code: "zoom_error", message: "Could not reach Zoom." };
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function zoomRequest(
  path: string,
  init: { method: string; body?: unknown },
  attempt = 0
): Promise<ZoomResult<{ status: number; data: Record<string, unknown> }>> {
  const token = await getToken(attempt > 0 && cachedToken === null);
  if (!token.ok) return token;

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method: init.method,
      headers: {
        Authorization: `Bearer ${token.token}`,
        "content-type": "application/json",
      },
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
      cache: "no-store",
    });
  } catch (error) {
    console.error("Zoom request error:", error);
    return { ok: false, code: "zoom_error", message: "Could not reach Zoom." };
  }

  // Token revoked or expired early: fetch a fresh one once.
  if (res.status === 401 && attempt === 0) {
    cachedToken = null;
    return zoomRequest(path, init, attempt + 1);
  }
  // Zoom limits how fast registrations can be added: wait a moment and retry.
  if (res.status === 429 && attempt < 3) {
    const wait = Math.min(3000, (Number(res.headers.get("retry-after")) || 1) * 1000);
    await sleep(wait);
    return zoomRequest(path, init, attempt + 1);
  }

  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (res.ok) return { ok: true, status: res.status, data };

  const code = Number(data.code);
  const message = typeof data.message === "string" ? data.message : "";
  if (res.status === 429) {
    return { ok: false, code: "rate_limited", message: "Zoom is busy, please try again in a moment." };
  }
  if (code === 3027 || /registration.*(not|isn't|is not).*enabled/i.test(message)) {
    return {
      ok: false,
      code: "registration_off",
      message: "Registration is not turned on for this Zoom meeting. In Zoom, edit the meeting and set Registration to Required.",
    };
  }
  if (res.status === 404 || code === 3001) {
    return { ok: false, code: "meeting_not_found", message: "Zoom could not find that meeting number. Check the meeting link saved on this batch." };
  }
  if (res.status === 401 || res.status === 403) {
    return {
      ok: false,
      code: "auth_failed",
      message: "The Zoom app does not have permission for this. Check the app's scopes in the Zoom Marketplace.",
    };
  }
  console.error("Zoom API error:", res.status, JSON.stringify(data).slice(0, 300));
  return { ok: false, code: "zoom_error", message: message || `Zoom returned an error (${res.status}).` };
}

export function splitName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  const first = parts.shift() ?? "Student";
  return { first, last: parts.join(" ") };
}

// Registers one person for a meeting and returns their personal join link.
export async function registerParticipant(args: {
  meetingId: string;
  email: string;
  name: string;
}): Promise<ZoomResult<{ registrantId: string; joinUrl: string }>> {
  const { first, last } = splitName(args.name);
  const res = await zoomRequest(`/meetings/${encodeURIComponent(args.meetingId)}/registrants`, {
    method: "POST",
    body: {
      email: args.email,
      first_name: first,
      last_name: last || "-",
      auto_approve: true,
    },
  });
  if (!res.ok) return res;

  const registrantId = typeof res.data.registrant_id === "string" ? res.data.registrant_id : "";
  const joinUrl = typeof res.data.join_url === "string" ? res.data.join_url : "";
  if (!registrantId || !/^https:\/\//i.test(joinUrl)) {
    return { ok: false, code: "zoom_error", message: "Zoom did not return a personal link." };
  }
  return { ok: true, registrantId, joinUrl };
}

// Cancels personal links (e.g. a student is removed from the batch).
export async function cancelRegistrants(args: {
  meetingId: string;
  registrants: { id: string; email: string }[];
}): Promise<ZoomResult<object>> {
  if (args.registrants.length === 0) return { ok: true };
  const res = await zoomRequest(
    `/meetings/${encodeURIComponent(args.meetingId)}/registrants/status`,
    { method: "PUT", body: { action: "cancel", registrants: args.registrants } }
  );
  return res.ok ? { ok: true } : res;
}
