import { readFile } from "node:fs/promises";
import { resolve, sep } from "node:path";

import { NextResponse } from "next/server";

import { requireMemberRequest } from "../../../../server/auth/request-session";
import { prisma } from "../../../../server/db/client";

type RouteContext = {
  params: Promise<{ assetId: string }>;
};

type ImageAssetRecord = {
  id: string;
  upstreamUrl: string | null;
  localPath: string | null;
  mimeType: string | null;
};

async function resolveAssetId(context: RouteContext): Promise<string> {
  const params = await context.params;

  return params.assetId;
}

function notFound(): Response {
  return NextResponse.json({ error: "Image asset not found" }, { status: 404 });
}

function resolveLocalPath(localPath: string): string | null {
  const storageRoot = resolve(process.env.STORAGE_ROOT ?? "storage/generated-images");
  const resolvedPath = resolve(localPath);
  const storagePrefix = storageRoot.endsWith(sep) ? storageRoot : `${storageRoot}${sep}`;

  if (resolvedPath !== storageRoot && !resolvedPath.startsWith(storagePrefix)) {
    return null;
  }

  return resolvedPath;
}

async function readLocalImage(asset: ImageAssetRecord): Promise<Response> {
  if (!asset.localPath) {
    return notFound();
  }

  const localPath = resolveLocalPath(asset.localPath);

  if (!localPath) {
    return notFound();
  }

  const bytes = await readFile(localPath).catch(() => null);

  if (!bytes) {
    return notFound();
  }

  return new Response(new Uint8Array(bytes), {
    headers: {
      "Content-Type": asset.mimeType ?? "image/png",
      "Cache-Control": "private, max-age=3600"
    }
  });
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
    const assetId = await resolveAssetId(context);
    const asset = await prisma.imageAsset.findFirst({
      where: {
        id: assetId,
        ...(session.role === "ADMIN" ? {} : { job: { userId: session.userId } })
      }
    });

    if (!asset) {
      return notFound();
    }

    if (asset.localPath) {
      return readLocalImage(asset);
    }

    if (asset.upstreamUrl) {
      return NextResponse.redirect(asset.upstreamUrl);
    }

    return notFound();
  } catch (error) {
    return toErrorResponse(error);
  }
}
