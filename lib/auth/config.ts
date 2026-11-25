/** Auth security constants — change here, not scattered in UI/API code. */

import {
  GENERIC_AUTH_ERROR,
  PASSWORD_MIN_LENGTH,
  SESSION_IDLE_MS,
  SESSION_WARN_MS,
} from "@/lib/auth/messages";

export {
  GENERIC_AUTH_ERROR,
  PASSWORD_MIN_LENGTH,
  SESSION_IDLE_MS,
  SESSION_WARN_MS,
};

export const AUTH_COOKIE_NAME = "pharmacy_session";

/** Failed attempts before lock. */
export const LOCKOUT_MAX_ATTEMPTS = 5;

/** Lock duration after max failed attempts (ms). */
export const LOCKOUT_DURATION_MS = 15 * 60 * 1000;

/** Invite token lifetime (ms). */
export const INVITE_TTL_MS = 48 * 60 * 60 * 1000;

/** Pending MFA challenge lifetime (ms). */
export const MFA_CHALLENGE_TTL_MS = 10 * 60 * 1000;

export const TOTP_ISSUER = "Canadian Pharmacy OS";

export function getSessionSecret(): string {
  const secret = process.env.AUTH_SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SESSION_SECRET must be set (min 32 characters)");
  }
  return secret;
}

export function getBootstrapAdmin() {
  return {
    email: (process.env.AUTH_ADMIN_EMAIL || "admin@gmail.com").trim().toLowerCase(),
    password: process.env.AUTH_ADMIN_PASSWORD || "",
    name: process.env.AUTH_ADMIN_NAME || "Admin",
  };
}
