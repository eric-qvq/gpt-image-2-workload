export type SaveImageInput = {
  jobId: string;
  index: number;
  bytes: Buffer;
  extension: string;
};

export type SaveImageResult = {
  localPath: string;
  fileSize: number;
  mimeType?: string;
};

export type StorageAdapter = {
  saveImage(input: SaveImageInput): Promise<SaveImageResult>;
};
