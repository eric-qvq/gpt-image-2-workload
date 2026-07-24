import { NextResponse } from "next/server";

import { requireMemberRequest } from "../../../../server/auth/request-session";
import { prisma } from "../../../../server/db/client";

type RouteContext = {
  params: Promise<{ jobId: string }>;
};

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
    const session = await requireMemberRequest(request);
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
