// @vitest-environment node

import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

import { GET } from "../../src/app/api/image-assets/[assetId]/route";
import { createSessionToken } from "../../src/server/auth/session";

const secret = "test-secret-with-at-least-32-characters";

const mocks = vi.hoisted(() => ({
  imageAssetFindFirst: vi.fn()
}));

vi.mock("../../src/server/db/client", () => ({
  prisma: {
    imageAsset: {
      findFirst: mocks.imageAssetFindFirst
    }
  }
}));

function authedGet(token: string): Request {
  return new Request("http://localhost/api/image-assets/asset_1", {
    headers: {
      cookie: `session=${token}`
    }
  });
}

describe("image asset API", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("serves local archived images for the owning member", async () => {
    process.env.AUTH_SECRET = secret;
    const storageRoot = await mkdtemp(join(tmpdir(), "gpt-image-assets-"));
    const imagePath = join(storageRoot, "job_1", "0.png");
    await mkdir(join(storageRoot, "job_1"));
    await writeFile(imagePath, Buffer.from("png-bytes"));
    process.env.STORAGE_ROOT = storageRoot;
    mocks.imageAssetFindFirst.mockResolvedValueOnce({
      id: "asset_1",
      jobId: "job_1",
      upstreamUrl: null,
      localPath: imagePath,
      mimeType: "image/png"
    });

    try {
      const token = await createSessionToken({ userId: "user_1", role: "MEMBER" }, secret);
      const response = await GET(authedGet(token), {
        params: Promise.resolve({ assetId: "asset_1" })
      });

      expect(response.status).toBe(200);
      expect(response.headers.get("content-type")).toBe("image/png");
      expect(Buffer.from(await response.arrayBuffer()).toString()).toBe("png-bytes");
      expect(mocks.imageAssetFindFirst).toHaveBeenCalledWith({
        where: {
          id: "asset_1",
          job: {
            userId: "user_1"
          }
        }
      });
    } finally {
      await rm(storageRoot, { recursive: true, force: true });
    }
  });
});
