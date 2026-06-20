// ─────────────────────────────────────────────────────────────────────────────
// Session storage. The JWT returned by the API is persisted in a readable
// (non-httpOnly) cookie so that middleware, server components and client
// components can all access it. This replaces Supabase's cookie session.
// ─────────────────────────────────────────────────────────────────────────────

import type { AuthResponse, BackendRole, Session } from "@/types";

export const SESSION_COOKIE = "clinco_session";

// Cookie lifetime matches the access-token lifetime (30 days).
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

export function sessionFromAuth(auth: AuthResponse): Session {
  return {
    token: auth.accessToken,
    expiresAt: auth.expiresAt,
    userId: auth.userId,
    fullName: auth.fullName,
    email: auth.email,
    role: auth.role
  };
}

export function encodeSession(session: Session): string {
  return encodeURIComponent(JSON.stringify(session));
}

export function decodeSession(raw: string | undefined | null): Session | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as Session;
    if (!parsed?.token || !parsed?.role) return null;
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Landing route for a role. Clinic staff share the staff portal.
 */
export function homeForRole(role: BackendRole): string {
  return role === "Doctor" || role === "Receptionist" || role === "Admin" ? "/doctor/dashboard" : "/login";
}

// ── Client-side cookie access (browser only) ──────────────────────────────────

export function getClientSession(): Session | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${SESSION_COOKIE}=`));
  return decodeSession(match?.slice(SESSION_COOKIE.length + 1));
}

// Append Secure when served over HTTPS so the token cookie isn't sent over plain HTTP.
function cookieAttrs(): string {
  const secure = typeof location !== "undefined" && location.protocol === "https:" ? "; Secure" : "";
  return `; path=/; samesite=lax${secure}`;
}

export function setClientSession(session: Session): void {
  if (typeof document === "undefined") return;
  document.cookie = `${SESSION_COOKIE}=${encodeSession(session)}; max-age=${MAX_AGE_SECONDS}${cookieAttrs()}`;
}

export function clearClientSession(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${SESSION_COOKIE}=; max-age=0${cookieAttrs()}`;
}
