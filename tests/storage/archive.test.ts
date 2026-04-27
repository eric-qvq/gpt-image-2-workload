// @vitest-environment node

import { describe, expect, it, vi } from "vitest";

import { archiveGeneratedImages } from "../../src/server/storage/archive";

function createMockDb() {
  return {
    imageAsset: {
      create: vi.fn(async ({ data }) => ({
        id: `asset_${data.index ?? 0}`,
        createdAt: new Date("2026-04-27T00:00:00Z"),
        updatedAt: new Date("2026-04-27T00:00:00Z"),
        ...data
      }))
    }
  };
}

function createMockStorage() {
  return {
    saveImage: vi.fn(async ({ jobId, index, bytes, extension }) => ({
      localPath: `storage/generated-images/${jobId}/${index}.${extension}`,
      fileSize: bytes.length,
      mimeType: `image/${extension}`
    }))
  };
}

describe("image archive service", () => {
  it("archives URL and base64 generated images into image assets", async () => {
    const db = createMockDb();
    const storage = createMockStorage();
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(Buffer.from("url-image"), {
        status: 200,
        headers: { "content-type": "image/png" }
      })
    );

    const result = await archiveGeneratedImages(
      { id: "job_1" },
      [
        { upstreamUrl: "https://example.com/a.png" },
        { b64Json: Buffer.from("base64-image").toString("base64") }
      ],
      { db, storage }
    );

    expect(result.status).toBe("archived");
    expect(db.imageAsset.create).toHaveBeenCalledTimes(2);
    expect(db.imageAsset.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        jobId: "job_1",
        upstreamUrl: "https://example.com/a.png",
        localPath: "storage/generated-images/job_1/0.png"
      })
    });
    expect(db.imageAsset.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        jobId: "job_1",
        localPath: "storage/generated-images/job_1/1.png"
      })
    });
  });

  it("returns archive_failed only when every image fails", async () => {
    const db = createMockDb();
    const storage = createMockStorage();
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("missing", { status: 404 })
    );

    const result = await archiveGeneratedImages(
      { id: "job_1" },
      [{ upstreamUrl: "https://example.com/missing.png" }],
      { db, storage }
    );

    expect(result.status).toBe("archive_failed");
    expect(result.failures).toHaveLength(1);
    expect(db.imageAsset.create).not.toHaveBeenCalled();
  });
});
