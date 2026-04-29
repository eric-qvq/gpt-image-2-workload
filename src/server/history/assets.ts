import type { Session } from "../auth/session";
import { prisma } from "../db/client";

type PrimitiveParam = string | number | boolean;

type HistoryAssetRecord = {
  id: string;
  createdAt: Date;
  job: {
    userId: string;
    prompt: string;
    providerId: string;
    modelId: string;
    requestParams: unknown;
    model: {
      name: string;
    };
  };
};

type HistoryDb = {
  imageAsset: {
    findMany(args: {
      where: Record<string, unknown>;
      include: {
        job: {
          include: {
            model: true;
          };
        };
      };
      orderBy: { createdAt: "asc" | "desc" };
    }): Promise<HistoryAssetRecord[]>;
  };
};

type HistoryContext = {
  db?: HistoryDb;
};

function resolveDb(db?: HistoryDb): HistoryDb {
  return (db ?? prisma) as HistoryDb;
}

function isPrimitiveParam(value: unknown): value is PrimitiveParam {
  return (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  );
}

function toRequestParams(value: unknown): Record<string, PrimitiveParam> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value).filter((entry): entry is [string, PrimitiveParam] =>
      isPrimitiveParam(entry[1])
    )
  );
}

export async function listHistoryAssets(
  session: Session,
  context: HistoryContext = {}
) {
  const assets = await resolveDb(context.db).imageAsset.findMany({
    where: session.role === "ADMIN" ? {} : { job: { userId: session.userId } },
    include: {
      job: {
        include: {
          model: true
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return assets.map((asset) => ({
    id: asset.id,
    src: `/api/image-assets/${asset.id}`,
    prompt: asset.job.prompt,
    providerId: asset.job.providerId,
    modelId: asset.job.modelId,
    model: asset.job.model.name,
    createdAt: asset.createdAt.toISOString(),
    requestParams: toRequestParams(asset.job.requestParams)
  }));
}
