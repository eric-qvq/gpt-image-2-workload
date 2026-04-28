import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";

import { requireMember } from "../../../../../server/auth/guards";
import { verifySessionToken } from "../../../../../server/auth/session";
import { prisma } from "../../../../../server/db/client";

type RouteContext = {
  params: Promise<{ conversationId: string }>;
};

type MessageRequest = {
  prompt?: string;
  providerId?: string;
  modelId?: string;
  requestParams?: Record<string, unknown>;
};

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

async function resolveConversationId(context: RouteContext): Promise<string> {
  const params = await context.params;

  return params.conversationId;
}

function requireString(value: string | undefined, name: string): string {
  if (!value?.trim()) {
    throw new Error(`${name} is required`);
  }

  return value.trim();
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

export async function POST(request: Request, context: RouteContext) {
  try {
    const session = await requireSession(request);
    const conversationId = await resolveConversationId(context);
    const body = (await request.json()) as MessageRequest;
    const prompt = requireString(body.prompt, "prompt");
    const providerId = requireString(body.providerId, "providerId");
    const modelId = requireString(body.modelId, "modelId");
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        userId: session.userId
      }
    });

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const message = await tx.message.create({
        data: {
          conversationId,
          role: "USER",
          content: prompt
        }
      });
      const job = await tx.generationJob.create({
        data: {
          userId: session.userId,
          conversationId,
          messageId: message.id,
          providerId,
          modelId,
          prompt,
          requestParams: (body.requestParams ?? {}) as Prisma.InputJsonValue,
          status: "QUEUED"
        }
      });

      return { message, job };
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
