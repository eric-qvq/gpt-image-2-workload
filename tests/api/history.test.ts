// @vitest-environment node

import { describe, expect, it, vi } from "vitest";

import { GET as getJob } from "../../src/app/api/generation-jobs/[jobId]/route";
import { GET as getHistory } from "../../src/app/api/history/route";
import { createSessionToken } from "../../src/server/auth/session";

const secret = "test-secret-with-at-least-32-characters";

const mocks = vi.hoisted(() => ({
  generationJobFindFirst: vi.fn(async () => ({
    id: "job_1",
    userId: "user_1",
    status: "ARCHIVED",
    error: null,
    prompt: "Draw a red cube",
    requestParams: { size: "1024x1024" },
    createdAt: new Date("2026-04-27T00:00:00Z"),
    imageAssets: [
      {
        id: "asset_1",
        jobId: "job_1",
        localPath: "storage/generated-images/job_1/0.png",
        upstreamUrl: "https://example.com/a.png"
      }
    ]
  })),
  imageAssetFindMany: vi.fn(async () => [
    {
      id: "asset_1",
      jobId: "job_1",
      localPath: "storage/generated-images/job_1/0.png",
      upstreamUrl: "https://example.com/a.png",
      job: {
        id: "job_1",
        userId: "user_1",
        prompt: "Draw a red cube",
        model: { name: "gpt-image-2" }
      }
    }
  ])
}));

vi.mock("../../src/server/db/client", () => ({
  prisma: {
    generationJob: { findFirst: mocks.generationJobFindFirst },
    imageAsset: { findMany: mocks.imageAssetFindMany }
  }
}));

function authedGet(url: string, token: string): Request {
  return new Request(url, {
    headers: {
      cookie: `session=${token}`
    }
  });
}

describe("history APIs", () => {
  it("returns job status and current member history", async () => {
    process.env.AUTH_SECRET = secret;
    const token = await createSessionToken({ userId: "user_1", role: "MEMBER" }, secret);

    const jobResponse = await getJob(
      authedGet("http://localhost/api/generation-jobs/job_1", token),
      { params: { jobId: "job_1" } }
    );
    const jobBody = await jobResponse.json();

    expect(jobResponse.status).toBe(200);
    expect(jobBody.job).toMatchObject({
      id: "job_1",
      status: "ARCHIVED"
    });
    expect(jobBody.job.imageAssets).toHaveLength(1);

    const historyResponse = await getHistory(
      authedGet("http://localhost/api/history", token)
    );
    const historyBody = await historyResponse.json();

    expect(historyResponse.status).toBe(200);
    expect(historyBody.assets[0]).toMatchObject({
      jobId: "job_1",
      localPath: "storage/generated-images/job_1/0.png"
    });
  });
});
