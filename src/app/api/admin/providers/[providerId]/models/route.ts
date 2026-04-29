import { NextResponse } from "next/server";

import { requireAdminRequest } from "@/server/auth/request-session";
import { createModel, listModelsForProvider } from "@/server/providers/repository";

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

export async function GET(request: Request, context: RouteContext) {
  try {
    await requireAdminRequest(request);
    const providerId = await resolveProviderId(context);

    return NextResponse.json({
      models: await listModelsForProvider(providerId)
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    await requireAdminRequest(request);
    const providerId = await resolveProviderId(context);
    const body = await request.json();
    const model = await createModel(providerId, body);

    return NextResponse.json({ model }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
