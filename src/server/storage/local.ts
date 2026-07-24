import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

import type { SaveImageInput, SaveImageResult } from "./types";

function normalizeExtension(extension: string): string {
  return extension.replace(/^\./, "").toLowerCase();
}

export class LocalStorageAdapter {
  constructor(private readonly storageRoot = process.env.STORAGE_ROOT ?? "storage/generated-images") {}

  async saveImage({
    jobId,
    index,
    bytes,
    extension
  }: SaveImageInput): Promise<SaveImageResult> {
    const normalizedExtension = normalizeExtension(extension);
    const directory = join(this.storageRoot, jobId);
    const localPath = join(directory, `${index}.${normalizedExtension}`);

    await mkdir(directory, { recursive: true });
    await writeFile(localPath, bytes);

    return {
      localPath,
      fileSize: bytes.length,
      mimeType: `image/${normalizedExtension}`
    };
  }
}
