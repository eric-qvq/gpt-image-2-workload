import { NextResponse } from "next/server";

import { requireMember } from "../../../server/auth/guards";
import { verifySessionToken } from "../../../server/auth/session";
import { prisma } from "../../../server/db/client";

async function requireSession(request: Request) {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const sessionCookie = cookieHeader
    .split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith("session="));
  const token = sessionCookie?.slice("session=".length);
  const session = token
    ? await verifySessionToken(token).catch(() => null)
    : null;

  return requireMember(session);
}

function toErrorResponse(error: unknown): Response {
  if (error instanceof Response) {
    return error;
  }

  return NextResponse.json(
    { error: error instanceof Error ? error.message : "Unexpected error" },
    { status: 400 }
  );
}

export async function GET(request: Request) {
  try {
    const session = await requireSession(request);
    const assets = await prisma.imageAsset.findMany({
      where: {
        job: {
          userId: session.userId
        }
      },
      include: {
        job: {
          include: {
            model: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ assets });
  } catch (error) {
    return toErrorResponse(error);
  }
}
