// @vitest-environment node

import { describe, expect, it, vi } from "vitest";

import {
  claimNextJob,
  createGenerationJob,
  markJobFailed,
  markJobSucceeded,
  requeueJob
} from "../../src/server/jobs/repository";

function createMockDb() {
  const queuedJob = {
    id: "job_1",
    userId: "user_1",
    conversationId: "conversation_1",
    messageId: "message_1",
    providerId: "provider_1",
    modelId: "model_1",
    prompt: "Draw a red cube",
    requestParams: { size: "1024x1024" },
    upstreamResponse: null,
    status: "QUEUED" as const,
    error: null,
    retryCount: 0,
    createdAt: new Date("2026-04-27T00:00:00Z"),
    updatedAt: new Date("2026-04-27T00:00:00Z")
  };

  const db = {
    generationJob: {
      create: vi.fn(async ({ data }) => ({
        id: "job_1",
        createdAt: new Date("2026-04-27T00:00:00Z"),
        updatedAt: new Date("2026-04-27T00:00:00Z"),
        status: "QUEUED",
        error: null,
        retryCount: 0,
        upstreamResponse: null,
        ...data
      })),
      findFirst: vi.fn(async () => queuedJob),
      update: vi.fn(async ({ where, data }) => ({
        ...queuedJob,
        id: where.id,
        ...data
      }))
    },
    $transaction: vi.fn(async (callback) => callback(db))
  };

  return db;
}

describe("generation job repository", () => {
  it("creates queued generation jobs", async () => {
    const db = createMockDb();

    const job = await createGenerationJob(
      {
        userId: "user_1",
        conversationId: "conversation_1",
        messageId: "message_1",
        providerId: "provider_1",
        modelId: "model_1",
        prompt: "Draw a red cube",
        requestParams: { size: "1024x1024" }
      },
      { db }
    );

    expect(db.generationJob.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        status: "QUEUED",
        prompt: "Draw a red cube"
      })
    });
    expect(job.status).toBe("QUEUED");
  });

  it("claims the oldest queued job and marks it running", async () => {
    const db = createMockDb();

    const job = await claimNextJob({ db });

    expect(db.generationJob.findFirst).toHaveBeenCalledWith({
      where: { status: "QUEUED" },
      orderBy: { createdAt: "asc" }
    });
    expect(db.generationJob.update).toHaveBeenCalledWith({
      where: { id: "job_1" },
      data: { status: "RUNNING", error: null }
    });
    expect(job?.status).toBe("RUNNING");
  });

  it("marks jobs succeeded or failed", async () => {
    const db = createMockDb();

    await markJobSucceeded("job_1", { data: [{ url: "https://example.com/a.png" }] }, { db });
    await markJobFailed("job_1", "provider failed", { db });
    await requeueJob("job_1", 1, "temporary provider failure", { db });

    expect(db.generationJob.update).toHaveBeenCalledWith({
      where: { id: "job_1" },
      data: {
        status: "SUCCEEDED",
        upstreamResponse: { data: [{ url: "https://example.com/a.png" }] },
        error: null
      }
    });
    expect(db.generationJob.update).toHaveBeenCalledWith({
      where: { id: "job_1" },
      data: { status: "FAILED", error: "provider failed" }
    });
    expect(db.generationJob.update).toHaveBeenCalledWith({
      where: { id: "job_1" },
      data: {
        status: "QUEUED",
        retryCount: 1,
        error: "temporary provider failure"
      }
    });
  });
});
