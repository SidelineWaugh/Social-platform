/**
 * Minimal admin auth: a single shared password (env `ADMIN_PASSWORD`) gates the
 * /admin dashboard. On success we set an HMAC-signed session cookie so we don't
 * store the password anywhere. Built on Web Crypto so it runs in any runtime.
 *
 * This is intentionally simple for the single-admin (Sideline) phase. It is
 * structured to grow into per-organizer accounts later without changing callers.
 */

export const SESSION_COOKIE = "sl_admin";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

const encoder = new TextEncoder();

function sessionSecret(): string {
  return process.env.SESSION_SECRET || "insecure-dev-secret";
}

function toBase64Url(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(s: string): string {
  const padded = s.replace(/-/g, "+").replace(/_/g, "/");
  return atob(padded);
}

async function sign(payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(sessionSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return toBase64Url(new Uint8Array(sig));
}

/** Constant-time-ish string comparison. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export function verifyPassword(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD || "";
  return expected.length > 0 && safeEqual(input, expected);
}

export async function createSessionToken(): Promise<string> {
  const payload = toBase64Url(encoder.encode(String(Date.now())));
  const sig = await sign(payload);
  return `${payload}.${sig}`;
}

export async function verifySessionToken(token?: string): Promise<boolean> {
  if (!token) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;
  if (!safeEqual(sig, await sign(payload))) return false;
  const issued = Number(fromBase64Url(payload));
  if (!Number.isFinite(issued)) return false;
  return Date.now() - issued < MAX_AGE_SECONDS * 1000;
}

export const SESSION_MAX_AGE = MAX_AGE_SECONDS;
