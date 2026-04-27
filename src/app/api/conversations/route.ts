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

export async function POST(request: Request) {
  try {
    const session = await requireSession(request);
    const body = (await request.json()) as { title?: string };
    const conversation = await prisma.conversation.create({
      data: {
        userId: session.userId,
        title: body.title?.trim() || "Untitled conversation"
      }
    });

    return NextResponse.json({ conversation }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
