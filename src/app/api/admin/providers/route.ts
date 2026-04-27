import { NextResponse } from "next/server";

import { requireAdmin } from "@/server/auth/guards";
import { verifySessionToken } from "@/server/auth/session";
import { createProvider, listProviders } from "@/server/providers/repository";

async function requireAdminRequest(request: Request) {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const sessionCookie = cookieHeader
    .split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith("session="));
  const token = sessionCookie?.slice("session=".length);
  const session = token
    ? await verifySessionToken(token).catch(() => null)
    : null;

  return requireAdmin(session);
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
