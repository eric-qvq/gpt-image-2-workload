export type ProviderOption = {
  id: string;
  name: string;
};

export type ModelOption = {
  id: string;
  providerId: string;
  name: string;
  defaultParams: unknown;
  capabilities: unknown;
};

export type ConnectedGenerationParameters = {
  providerId: string;
  modelId: string;
  size: string;
  count: number;
  quality: "standard" | "high";
  responseFormat: "url" | "b64_json";
};

export type PrototypeGenerationParameters = {
  previewQuality: "ultra" | null;
  style: "auto" | "vivid" | "natural";
  seed: string;
  guidance: number;
  outputFormat: "png" | "jpeg" | "webp";
  safetyFilter: boolean;
};

export const defaultPrototypeParameters: PrototypeGenerationParameters = {
  previewQuality: null,
  style: "auto",
  seed: "",
  guidance: 7.5,
  outputFormat: "png",
  safetyFilter: true
};
