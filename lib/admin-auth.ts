import { createHmac, timingSafeEqual } from "crypto";

export const ADMIN_COOKIE_NAME = "admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;

function getSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;

  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET is not set");
  }

  return secret;
}

function sign(payload: string) {
  return createHmac("sha256", getSecret()).update(payload).digest("hex");
}

export async function createAdminSession(adminId: number) {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const payload = `${adminId}.${expiresAt}`;
  const signature = sign(payload);

  return `${payload}.${signature}`;
}

export async function verifyAdminSession(sessionValue?: string | null) {
  if (!sessionValue) return null;

  const parts = sessionValue.split(".");
  if (parts.length !== 3) return null;

  const [adminIdRaw, expiresAtRaw, signature] = parts;
  const payload = `${adminIdRaw}.${expiresAtRaw}`;
  const expectedSignature = sign(payload);

  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    return null;
  }

  const adminId = Number(adminIdRaw);
  const expiresAt = Number(expiresAtRaw);

  if (!Number.isInteger(adminId) || !Number.isInteger(expiresAt)) {
    return null;
  }

  if (expiresAt < Math.floor(Date.now() / 1000)) {
    return null;
  }

  return { adminId, expiresAt };
}