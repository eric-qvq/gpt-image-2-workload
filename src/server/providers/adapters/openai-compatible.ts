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

type NonJsonPayload = {
  contentType: string | null;
  bodyPreview: string;
};

export class ProviderRequestError extends Error {
  readonly status: number;
  readonly payload: unknown;

  constructor(status: number, message: string, payload: unknown) {
    super(`Provider request failed with ${status}: ${message}`);
    this.name = "ProviderRequestError";
    this.status = status;
    this.payload = payload;
  }
}

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

function parseProviderPayload(response: Response, text: string): ProviderResponse {
  try {
    return JSON.parse(text) as ProviderResponse;
  } catch {
    const contentType = response.headers.get("content-type");
    const message = `Upstream returned ${contentType ?? "non-JSON content"} instead of JSON. Check the provider API base URL and access permissions.`;
    const payload: NonJsonPayload = {
      contentType,
      bodyPreview: text.slice(0, 300)
    };

    throw new ProviderRequestError(response.status, message, payload);
  }
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
  const payload = parseProviderPayload(response, await response.text());

  if (!response.ok) {
    const message = payload.error?.message ?? response.statusText;
    throw new ProviderRequestError(response.status, message, payload);
  }

  return (payload.data ?? []).map(normalizeImage);
}
