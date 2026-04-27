import { prisma } from "../db/client";
import {
  markJobArchived,
  markJobFailed,
  markJobSucceeded
} from "../jobs/repository";
import { decryptApiKey } from "../providers/encryption";
import { getProviderAdapter } from "../providers/adapters/registry";
import type {
  GeneratedImage,
  ImageProviderAdapter
} from "../providers/adapters/types";
import { archiveGeneratedImages } from "../storage/archive";

type WorkerJob = {
  id: string;
  prompt: string;
  requestParams: Record<string, unknown>;
  provider: {
    type: "OPENAI_OFFICIAL" | "OPENAI_COMPATIBLE" | "CUSTOM_HTTP";
    baseUrl: string;
    encryptedApiKey: string;
  };
  model: {
    name: string;
  };
};

type WorkerDb = {
  generationJob: {
    findUnique(args: {
      where: { id: string };
      include: { provider: true; model: true };
    }): Promise<WorkerJob | null>;
  };
};

type ProcessJobDependencies = {
  db?: WorkerDb;
  getAdapter?: typeof getProviderAdapter;
  decryptApiKey?: typeof decryptApiKey;
  markJobSucceeded?: (jobId: string, upstreamResponse: unknown) => Promise<unknown>;
  markJobArchived?: (jobId: string) => Promise<unknown>;
  markJobFailed?: (jobId: string, error: string) => Promise<unknown>;
  archiveGeneratedImages?: typeof archiveGeneratedImages;
};

function resolveDb(db?: WorkerDb): WorkerDb {
  return (db ?? prisma) as WorkerDb;
}

function optionalString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function optionalCount(value: unknown): number | undefined {
  return typeof value === "number" ? value : undefined;
}

function optionalResponseFormat(value: unknown): "url" | "b64_json" | undefined {
  return value === "url" || value === "b64_json" ? value : undefined;
}

function buildAdapterRequest(job: WorkerJob) {
  return {
    prompt: job.prompt,
    model: job.model.name,
    size: optionalString(job.requestParams.size),
    quality: optionalString(job.requestParams.quality),
    count: optionalCount(job.requestParams.count),
    responseFormat: optionalResponseFormat(job.requestParams.responseFormat)
  };
}

export async function processGenerationJob(
  jobId: string,
  dependencies: ProcessJobDependencies = {}
): Promise<void> {
  const db = resolveDb(dependencies.db);
  const job = await db.generationJob.findUnique({
    where: { id: jobId },
    include: { provider: true, model: true }
  });

  if (!job) {
    throw new Error(`Generation job not found: ${jobId}`);
  }

  const failJob = dependencies.markJobFailed ?? markJobFailed;

  try {
    const adapterFactory = dependencies.getAdapter ?? getProviderAdapter;
    const adapter: ImageProviderAdapter = adapterFactory(job.provider.type);
    const apiKey = (dependencies.decryptApiKey ?? decryptApiKey)(
      job.provider.encryptedApiKey
    );
    const images: GeneratedImage[] = await adapter({
      baseUrl: job.provider.baseUrl,
      apiKey,
      request: buildAdapterRequest(job)
    });

    await (dependencies.markJobSucceeded ?? markJobSucceeded)(job.id, {
      data: images
    });

    const archiveResult = await (
      dependencies.archiveGeneratedImages ?? archiveGeneratedImages
    )(job, images);

    if (archiveResult.status === "archived") {
      await (dependencies.markJobArchived ?? markJobArchived)(job.id);
    } else {
      await failJob(job.id, "Image archive failed");
    }
  } catch (error) {
    await failJob(
      job.id,
      error instanceof Error ? error.message : "Unknown worker error"
    );
  }
}
