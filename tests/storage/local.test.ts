// @vitest-environment node

import { mkdtemp, readFile, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { LocalStorageAdapter } from "../../src/server/storage/local";

let tempDir: string | undefined;

describe("local storage adapter", () => {
  afterEach(async () => {
    if (tempDir) {
      await rm(tempDir, { recursive: true, force: true });
      tempDir = undefined;
    }
  });

  it("saves image bytes under the configured storage root", async () => {
    tempDir = await mkdtemp(join(tmpdir(), "image-storage-"));
    const adapter = new LocalStorageAdapter(tempDir);

    const result = await adapter.saveImage({
      jobId: "job_1",
      index: 0,
      bytes: Buffer.from("png-bytes"),
      extension: "png"
    });

    expect(result.localPath).toBe(join(tempDir, "job_1", "0.png"));
    await expect(readFile(result.localPath, "utf8")).resolves.toBe("png-bytes");
    await expect(stat(result.localPath)).resolves.toMatchObject({ size: 9 });
  });
});
