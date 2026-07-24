import { prisma } from "../db/client";
import type { GeneratedImage } from "../providers/adapters/types";
import { LocalStorageAdapter } from "./local";
import type { StorageAdapter } from "./types";

type ArchiveJob = {
  id: string;
};

type ImageAssetRecord = {
  id: string;
  jobId: string;
  upstreamUrl: string | null;
  localPath: string | null;
  fileSize: number | null;
  width: number | null;
  height: number | null;
  mimeType: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type ArchiveDb = {
  imageAsset: {
    create(args: {
      data: {
        jobId: string;
        upstreamUrl?: string | null;
        localPath?: string | null;
        fileSize?: number | null;
        mimeType?: string | null;
      };
    }): Promise<ImageAssetRecord>;
  };
};

type ArchiveContext = {
  db?: ArchiveDb;
  storage?: StorageAdapter;
};

type ArchiveFailure = {
  index: number;
  error: string;
};

type ArchiveResult = {
  status: "archived" | "archive_failed";
  assets: ImageAssetRecord[];
  failures: ArchiveFailure[];
};

function resolveDb(db?: ArchiveDb): ArchiveDb {
  return (db ?? prisma) as ArchiveDb;
}

function resolveStorage(storage?: StorageAdapter): StorageAdapter {
  return storage ?? new LocalStorageAdapter();
}

function extensionFromContentType(contentType: string | null): string {
  if (contentType?.includes("jpeg")) return "jpg";
  if (contentType?.includes("png")) return "png";
  if (contentType?.includes("webp")) return "webp";
  if (contentType?.includes("gif")) return "gif";
  if (contentType?.includes("avif")) return "avif";
  if (contentType?.includes("svg")) return "svg";

  return "png";
}

async function bytesFromImage(image: GeneratedImage): Promise<{
  bytes: Buffer;
  extension: string;
  mimeType?: string;
}> {
  if (image.b64Json) {
    return {
      bytes: Buffer.from(image.b64Json, "base64"),
      extension: "png",
      mimeType: "image/png"
    };
  }

  if (!image.upstreamUrl) {
    throw new Error("Generated image has no URL or base64 payload");
  }

  const response = await fetch(image.upstreamUrl);
  if (!response.ok) {
    throw new Error(`Image download failed with ${response.status}`);
  }

  const contentType = response.headers.get("content-type");

  return {
    bytes: Buffer.from(await response.arrayBuffer()),
    extension: extensionFromContentType(contentType),
    mimeType: contentType ?? undefined
  };
}

export async function archiveGeneratedImages(
  job: ArchiveJob,
  images: GeneratedImage[],
  context: ArchiveContext = {}
): Promise<ArchiveResult> {
  const db = resolveDb(context.db);
  const storage = resolveStorage(context.storage);
  const assets: ImageAssetRecord[] = [];
  const failures: ArchiveFailure[] = [];

  for (const [index, image] of images.entries()) {
    try {
      const imageBytes = await bytesFromImage(image);
      const saved = await storage.saveImage({
        jobId: job.id,
        index,
        bytes: imageBytes.bytes,
        extension: imageBytes.extension
      });
      const asset = await db.imageAsset.create({
        data: {
          jobId: job.id,
          upstreamUrl: image.upstreamUrl ?? null,
          localPath: saved.localPath,
          fileSize: saved.fileSize,
          mimeType: imageBytes.mimeType ?? saved.mimeType ?? null
        }
      });

      assets.push(asset);
    } catch (error) {
      failures.push({
        index,
        error: error instanceof Error ? error.message : "Unknown archive error"
      });
    }
  }

  return {
    status: assets.length > 0 ? "archived" : "archive_failed",
    assets,
    failures
  };
}
