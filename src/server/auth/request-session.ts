import { requireAdmin, requireMember } from "./guards";
import { verifySessionToken, type Session } from "./session";

const SESSION_COOKIE_NAME = "session";

export function getSessionCookieValue(cookieHeader: string | null | undefined): string | null {
  if (!cookieHeader) {
    return null;
  }

  const sessionCookie = cookieHeader
    .split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${SESSION_COOKIE_NAME}=`));
  const value = sessionCookie?.slice(`${SESSION_COOKIE_NAME}=`.length);

  if (!value) {
    return null;
  }

  try {
    return decodeURIComponent(value);
  } catch {
    return null;
  }
}

export async function getSessionFromToken(
  token: string | null | undefined
): Promise<Session | null> {
  if (!token) {
    return null;
  }

  return verifySessionToken(token).catch(() => null);
}

export async function getSessionFromCookieHeader(
  cookieHeader: string | null | undefined
): Promise<Session | null> {
  return getSessionFromToken(getSessionCookieValue(cookieHeader));
}

export async function getSessionFromRequest(request: Request): Promise<Session | null> {
  return getSessionFromCookieHeader(request.headers.get("cookie"));
}

export async function requireMemberRequest(request: Request): Promise<Session> {
  return requireMember(await getSessionFromRequest(request));
}

export async function requireAdminRequest(request: Request): Promise<Session> {
  return requireAdmin(await getSessionFromRequest(request));
}
