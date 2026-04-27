import type {
  GeneratedImage,
  ImageGenerationRequest,
  ImageProviderAdapterInput
} from "./types";

type ProviderImage = {
  url?: string;
  b64_json?: string;
  revised_prompt?: string;
};

type ProviderResponse = {
  data?: ProviderImage[];
  error?: {
    message?: string;
  };
};

function endpointFor(baseUrl: string): string {
  return `${baseUrl.replace(/\/+$/, "")}/images/generations`;
}

function toRequestBody(request: ImageGenerationRequest) {
  return {
    prompt: request.prompt,
    model: request.model,
    ...(request.size ? { size: request.size } : {}),
    ...(request.quality ? { quality: request.quality } : {}),
    ...(request.count ? { n: request.count } : {}),
    ...(request.responseFormat ? { response_format: request.responseFormat } : {})
  };
}

function normalizeImage(image: ProviderImage): GeneratedImage {
  return {
    ...(image.url ? { upstreamUrl: image.url } : {}),
    ...(image.b64_json ? { b64Json: image.b64_json } : {}),
    ...(image.revised_prompt ? { revisedPrompt: image.revised_prompt } : {})
  };
}

export async function generateOpenAICompatibleImage({
  baseUrl,
  apiKey,
  request
}: ImageProviderAdapterInput): Promise<GeneratedImage[]> {
  const response = await fetch(endpointFor(baseUrl), {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json"
    },
    body: JSON.stringify(toRequestBody(request))
  });
  const payload = (await response.json()) as ProviderResponse;

  if (!response.ok) {
    const message = payload.error?.message ?? response.statusText;
    throw new Error(`Provider request failed with ${response.status}: ${message}`);
  }

  return (payload.data ?? []).map(normalizeImage);
}
