import { NextResponse } from "next/server";

import { requireMemberRequest } from "../../../server/auth/request-session";
import { countHistoryAssets, listHistoryAssets } from "../../../server/history/assets";

function toErrorResponse(error: unknown): Response {
  if (error instanceof Response) {
    return error;
  }

  return NextResponse.json(
    { error: error instanceof Error ? error.message : "Unexpected error" },
    { status: 400 }
  );
}

function readNumberParam(url: URL, name: string): number | undefined {
  const rawValue = url.searchParams.get(name);

  if (rawValue === null) return undefined;

  const value = Number(rawValue);

  return Number.isFinite(value) ? value : undefined;
}

export async function GET(request: Request) {
  try {
    const session = await requireMemberRequest(request);
    const url = new URL(request.url);
    const options = {
      limit: readNumberParam(url, "limit"),
      offset: readNumberParam(url, "offset")
    };
    const [assets, total] = await Promise.all([
      listHistoryAssets(session, options),
      countHistoryAssets(session)
    ]);

    return NextResponse.json({
      assets,
      pagination: {
        total,
        limit: options.limit ?? 50,
        offset: options.offset ?? 0
      }
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
