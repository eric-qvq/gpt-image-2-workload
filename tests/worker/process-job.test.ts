// @vitest-environment node

import { describe, expect, it, vi } from "vitest";

import { processGenerationJob } from "../../src/server/worker/process-job";

function createMockDb() {
  const job = {
    id: "job_1",
    providerId: "provider_1",
    modelId: "model_1",
    prompt: "Draw a red cube",
    requestParams: { size: "1024x1024", count: 1 },
    retryCount: 0,
    provider: {
      id: "provider_1",
      type: "OPENAI_COMPATIBLE" as const,
      baseUrl: "https://api.example.com/v1",
      encryptedApiKey: "encrypted-key"
    },
    model: {
      id: "model_1",
      name: "gpt-image-2"
    }
  };

  return {
    generationJob: {
      findUnique: vi.fn(async () => job)
    }
  };
}

describe("processGenerationJob", () => {
  it("calls adapter, marks success, and archives generated images", async () => {
    const db = createMockDb();
    const adapter = vi.fn(async () => [{ upstreamUrl: "https://example.com/a.png" }]);
    const getAdapter = vi.fn(() => adapter);
    const decryptApiKey = vi.fn(() => "sk-test");
    const markJobSucceeded = vi.fn(async () => undefined);
    const markJobArchived = vi.fn(async () => undefined);
    const markJobFailed = vi.fn(async () => undefined);
    const archiveGeneratedImages = vi.fn(async () => ({
      status: "archived" as const,
      assets: [],
      failures: []
    }));

    await processGenerationJob("job_1", {
      db,
      getAdapter,
      decryptApiKey,
      markJobSucceeded,
      markJobArchived,
      markJobFailed,
      archiveGeneratedImages
    });

    expect(getAdapter).toHaveBeenCalledWith("OPENAI_COMPATIBLE");
    expect(adapter).toHaveBeenCalledWith({
      baseUrl: "https://api.example.com/v1",
      apiKey: "sk-test",
      request: {
        prompt: "Draw a red cube",
        model: "gpt-image-2",
        size: "1024x1024",
        count: 1
      }
    });
    expect(markJobSucceeded).toHaveBeenCalledWith(
      "job_1",
      { data: [{ upstreamUrl: "https://example.com/a.png" }] }
    );
    expect(markJobArchived).toHaveBeenCalledWith("job_1");
    expect(markJobFailed).not.toHaveBeenCalled();
  });

  it("requeues temporary adapter failures before marking jobs failed", async () => {
    const db = createMockDb();
    const adapter = vi.fn(async () => {
      throw new Error("provider failed");
    });
    const markJobFailed = vi.fn(async () => undefined);
    const requeueJob = vi.fn(async () => undefined);

    await processGenerationJob("job_1", {
      db,
      getAdapter: vi.fn(() => adapter),
      decryptApiKey: vi.fn(() => "sk-test"),
      markJobSucceeded: vi.fn(async () => undefined),
      markJobArchived: vi.fn(async () => undefined),
      markJobFailed,
      requeueJob,
      archiveGeneratedImages: vi.fn(async () => ({
        status: "archive_failed" as const,
        assets: [],
        failures: []
      }))
    });

    expect(requeueJob).toHaveBeenCalledWith("job_1", 1, "provider failed");
    expect(markJobFailed).not.toHaveBeenCalled();
  });

  it("marks adapter failures as failed jobs after retries are exhausted", async () => {
    const db = {
      generationJob: {
        findUnique: vi.fn(async () => ({
          ...await createMockDb().generationJob.findUnique(),
          retryCount: 2
        }))
      }
    };
    const adapter = vi.fn(async () => {
      throw new Error("provider failed");
    });
    const markJobFailed = vi.fn(async () => undefined);

    await processGenerationJob("job_1", {
      db,
      getAdapter: vi.fn(() => adapter),
      decryptApiKey: vi.fn(() => "sk-test"),
      markJobSucceeded: vi.fn(async () => undefined),
      markJobArchived: vi.fn(async () => undefined),
      markJobFailed,
      requeueJob: vi.fn(async () => undefined),
      archiveGeneratedImages: vi.fn(async () => ({
        status: "archive_failed" as const,
        assets: [],
        failures: []
      }))
    });

    expect(markJobFailed).toHaveBeenCalledWith("job_1", "provider failed");
  });
});
