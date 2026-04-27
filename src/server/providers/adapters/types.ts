export type ImageGenerationRequest = {
  prompt: string;
  model: string;
  size?: string;
  quality?: string;
  count?: number;
  responseFormat?: "url" | "b64_json";
};

export type GeneratedImage = {
  upstreamUrl?: string;
  b64Json?: string;
  revisedPrompt?: string;
};

export type ImageProviderAdapterInput = {
  baseUrl: string;
  apiKey: string;
  request: ImageGenerationRequest;
};

export type ImageProviderAdapter = (
  input: ImageProviderAdapterInput
) => Promise<GeneratedImage[]>;
