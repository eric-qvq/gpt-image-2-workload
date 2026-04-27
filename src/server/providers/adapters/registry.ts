import { generateOpenAICompatibleImage } from "./openai-compatible";
import type { ImageProviderAdapter } from "./types";

export type AdapterProviderType =
  | "OPENAI_OFFICIAL"
  | "OPENAI_COMPATIBLE"
  | "CUSTOM_HTTP";

export function getProviderAdapter(type: AdapterProviderType): ImageProviderAdapter {
  switch (type) {
    case "OPENAI_OFFICIAL":
    case "OPENAI_COMPATIBLE":
      return generateOpenAICompatibleImage;
    case "CUSTOM_HTTP":
      // MVP custom HTTP providers use the same request shape as OpenAI-compatible APIs.
      return generateOpenAICompatibleImage;
  }
}
