import { NextResponse } from "next/server";

import { requireMemberRequest } from "../../../server/auth/request-session";
import { prisma } from "../../../server/db/client";

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
    const session = await requireMemberRequest(request);
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
