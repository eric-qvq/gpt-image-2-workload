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

export async function GET(request: Request) {
  try {
    const session = await requireMemberRequest(request);
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
