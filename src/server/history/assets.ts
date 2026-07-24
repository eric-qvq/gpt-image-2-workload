import type { Session } from "../auth/session";
import { prisma } from "../db/client";

const DEFAULT_HISTORY_LIMIT = 50;
const MAX_HISTORY_LIMIT = 100;

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
      take?: number;
      skip?: number;
    }): Promise<HistoryAssetRecord[]>;
    count(args: { where: Record<string, unknown> }): Promise<number>;
  };
};

type HistoryContext = {
  db?: HistoryDb;
};

type HistoryOptions = {
  limit?: number;
  offset?: number;
};

function resolveDb(db?: HistoryDb): HistoryDb {
  return (db ?? prisma) as HistoryDb;
}

function normalizeLimit(limit: number | undefined): number {
  if (!Number.isFinite(limit)) return DEFAULT_HISTORY_LIMIT;

  return Math.min(Math.max(Math.trunc(limit ?? DEFAULT_HISTORY_LIMIT), 1), MAX_HISTORY_LIMIT);
}

function normalizeOffset(offset: number | undefined): number {
  if (!Number.isFinite(offset)) return 0;

  return Math.max(Math.trunc(offset ?? 0), 0);
}

function historyWhere(session: Session): Record<string, unknown> {
  return session.role === "ADMIN" ? {} : { job: { userId: session.userId } };
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

function toHistoryAsset(asset: HistoryAssetRecord) {
  return {
    id: asset.id,
    src: `/api/image-assets/${asset.id}`,
    prompt: asset.job.prompt,
    providerId: asset.job.providerId,
    modelId: asset.job.modelId,
    model: asset.job.model.name,
    createdAt: asset.createdAt.toISOString(),
    requestParams: toRequestParams(asset.job.requestParams)
  };
}

export async function listHistoryAssets(
  session: Session,
  options: HistoryOptions = {},
  context: HistoryContext = {}
) {
  const db = resolveDb(context.db);
  const where = historyWhere(session);
  const assets = await db.imageAsset.findMany({
    where,
    include: {
      job: {
        include: {
          model: true
        }
      }
    },
    orderBy: { createdAt: "desc" },
    take: normalizeLimit(options.limit),
    skip: normalizeOffset(options.offset)
  });

  return assets.map(toHistoryAsset);
}

export async function countHistoryAssets(
  session: Session,
  context: HistoryContext = {}
) {
  return resolveDb(context.db).imageAsset.count({
    where: historyWhere(session)
  });
}
