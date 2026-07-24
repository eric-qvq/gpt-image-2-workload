import { prisma } from "../db/client";
import type { GenerationJobInput } from "./types";

type JobStatus =
  | "QUEUED"
  | "RUNNING"
  | "SUCCEEDED"
  | "FAILED"
  | "CANCELED"
  | "ARCHIVED"
  | "ARCHIVE_FAILED";

type GenerationJobRecord = GenerationJobInput & {
  id: string;
  upstreamResponse: unknown | null;
  status: JobStatus;
  error: string | null;
  retryCount: number;
  createdAt: Date;
  updatedAt: Date;
};

type JobDb = {
  generationJob: {
    create(args: { data: GenerationJobInput & { status: "QUEUED" } }): Promise<GenerationJobRecord>;
    findFirst(args: {
      where: { status: "QUEUED" };
      orderBy: { createdAt: "asc" };
    }): Promise<GenerationJobRecord | null>;
    update(args: {
      where: { id: string };
      data: Partial<Pick<GenerationJobRecord, "status" | "error" | "upstreamResponse" | "retryCount">>;
    }): Promise<GenerationJobRecord>;
  };
  $transaction<T>(callback: (tx: JobDb) => Promise<T>): Promise<T>;
};

type JobRepositoryContext = {
  db?: JobDb;
};

function resolveDb(db?: JobDb): JobDb {
  return (db ?? prisma) as JobDb;
}

export async function createGenerationJob(
  input: GenerationJobInput,
  context: JobRepositoryContext = {}
) {
  return resolveDb(context.db).generationJob.create({
    data: {
      ...input,
      messageId: input.messageId ?? null,
      status: "QUEUED"
    }
  });
}

export async function claimNextJob(context: JobRepositoryContext = {}) {
  return resolveDb(context.db).$transaction(async (tx) => {
    const job = await tx.generationJob.findFirst({
      where: { status: "QUEUED" },
      orderBy: { createdAt: "asc" }
    });

    if (!job) {
      return null;
    }

    return tx.generationJob.update({
      where: { id: job.id },
      data: { status: "RUNNING", error: null }
    });
  });
}

export async function markJobSucceeded(
  jobId: string,
  upstreamResponse: unknown,
  context: JobRepositoryContext = {}
) {
  return resolveDb(context.db).generationJob.update({
    where: { id: jobId },
    data: {
      status: "SUCCEEDED",
      upstreamResponse,
      error: null
    }
  });
}

export async function markJobFailed(
  jobId: string,
  error: string,
  context: JobRepositoryContext = {}
) {
  return resolveDb(context.db).generationJob.update({
    where: { id: jobId },
    data: { status: "FAILED", error }
  });
}

export async function requeueJob(
  jobId: string,
  retryCount: number,
  error: string,
  context: JobRepositoryContext = {}
) {
  return resolveDb(context.db).generationJob.update({
    where: { id: jobId },
    data: {
      status: "QUEUED",
      retryCount,
      error
    }
  });
}

export async function markJobArchived(
  jobId: string,
  context: JobRepositoryContext = {}
) {
  return resolveDb(context.db).generationJob.update({
    where: { id: jobId },
    data: { status: "ARCHIVED", error: null }
  });
}
