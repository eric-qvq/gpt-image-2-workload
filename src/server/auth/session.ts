import { SignJWT, jwtVerify } from "jose";

export type SessionRole = "ADMIN" | "MEMBER";

export type Session = {
  userId: string;
  role: SessionRole;
};

type SessionJwtPayload = {
  userId?: unknown;
  role?: unknown;
};

function resolveSecret(secret = process.env.AUTH_SECRET): Uint8Array {
  if (!secret) {
    throw new Error("AUTH_SECRET is required");
  }

  return Buffer.from(secret, "utf8");
}

function parseSessionPayload(payload: SessionJwtPayload): Session {
  if (
    typeof payload.userId !== "string" ||
    (payload.role !== "ADMIN" && payload.role !== "MEMBER")
  ) {
    throw new Error("Invalid session token");
  }

  return {
    userId: payload.userId,
    role: payload.role
  };
}

export async function createSessionToken(
  session: Session,
  secret?: string
): Promise<string> {
  return new SignJWT(session)
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(session.userId)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(resolveSecret(secret));
}

export async function verifySessionToken(
  token: string,
  secret?: string
): Promise<Session> {
  try {
    const { payload } = await jwtVerify(token, resolveSecret(secret));

    return parseSessionPayload({
      userId: payload.userId,
      role: payload.role
    });
  } catch {
    throw new Error("Invalid session token");
  }
}
