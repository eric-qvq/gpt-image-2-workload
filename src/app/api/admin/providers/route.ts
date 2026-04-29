import { NextResponse } from "next/server";

import { requireAdminRequest } from "@/server/auth/request-session";
import { createProvider, listProviders } from "@/server/providers/repository";

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
    await requireAdminRequest(request);

    return NextResponse.json({ providers: await listProviders() });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdminRequest(request);
    const body = await request.json();
    const provider = await createProvider(body);

    return NextResponse.json({ provider }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
