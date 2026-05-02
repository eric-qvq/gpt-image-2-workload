import { NextResponse } from "next/server";

import { requireAdminRequest } from "@/server/auth/request-session";
import { updateProvider } from "@/server/providers/repository";

type RouteContext = {
  params: Promise<{ providerId: string }>;
};

async function resolveProviderId(context: RouteContext): Promise<string> {
  const params = await context.params;

  return params.providerId;
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

export async function PATCH(request: Request, context: RouteContext) {
  try {
    await requireAdminRequest(request);
    const providerId = await resolveProviderId(context);
    const body = await request.json();
    const provider = await updateProvider(providerId, body);

    return NextResponse.json({ provider });
  } catch (error) {
    return toErrorResponse(error);
  }
}
