import { NextResponse } from "next/server";

import { requireMember } from "../../../../server/auth/guards";
import { verifySessionToken } from "../../../../server/auth/session";
import { prisma } from "../../../../server/db/client";

type RouteContext = {
  params: Promise<{ jobId: string }> | { jobId: string };
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

async function resolveJobId(context: RouteContext): Promise<string> {
  const params = await context.params;

  return params.jobId;
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

export async function GET(request: Request, context: RouteContext) {
  try {
    const session = await requireSession(request);
    const jobId = await resolveJobId(context);
    const job = await prisma.generationJob.findFirst({
      where: {
        id: jobId,
        ...(session.role === "ADMIN" ? {} : { userId: session.userId })
      },
      include: {
        imageAssets: true
      }
    });

    if (!job) {
      return NextResponse.json({ error: "Generation job not found" }, { status: 404 });
    }

    return NextResponse.json({ job });
  } catch (error) {
    return toErrorResponse(error);
  }
}
