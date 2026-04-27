// @vitest-environment node

import { afterEach, describe, expect, it, vi } from "vitest";

import {
  ProviderRequestError,
  generateOpenAICompatibleImage
} from "../../src/server/providers/adapters/openai-compatible";

describe("OpenAI-compatible image adapter", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("posts generation requests and normalizes URL responses", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          data: [{ url: "https://example.com/image.png", revised_prompt: "A red cube" }]
        }),
        { status: 200, headers: { "content-type": "application/json" } }
      )
    );

    const images = await generateOpenAICompatibleImage({
      baseUrl: "https://api.example.com/v1/",
      apiKey: "sk-test",
      request: {
        prompt: "Draw a red cube",
        model: "gpt-image-2",
        size: "1024x1024",
        quality: "high",
        count: 1,
        responseFormat: "url"
      }
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.com/v1/images/generations",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          authorization: "Bearer sk-test",
          "content-type": "application/json"
        }),
        body: JSON.stringify({
          prompt: "Draw a red cube",
          model: "gpt-image-2",
          size: "1024x1024",
          quality: "high",
          n: 1,
          response_format: "url"
        })
      })
    );
    expect(images).toEqual([
      {
        upstreamUrl: "https://example.com/image.png",
        revisedPrompt: "A red cube"
      }
    ]);
  });

  it("normalizes base64 responses and throws structured provider errors", async () => {
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ data: [{ b64_json: "abc123" }] }), {
          status: 200,
          headers: { "content-type": "application/json" }
        })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ error: { message: "bad request" } }), {
          status: 400,
          headers: { "content-type": "application/json" }
        })
      );

    await expect(
      generateOpenAICompatibleImage({
        baseUrl: "https://api.example.com/v1",
        apiKey: "sk-test",
        request: {
          prompt: "Draw a red cube",
          model: "gpt-image-2"
        }
      })
    ).resolves.toEqual([{ b64Json: "abc123" }]);

    const failedRequest = generateOpenAICompatibleImage({
      baseUrl: "https://api.example.com/v1",
      apiKey: "sk-test",
      request: {
        prompt: "Draw a red cube",
        model: "gpt-image-2"
      }
    });

    await expect(failedRequest).rejects.toMatchObject({
      name: "ProviderRequestError",
      status: 400,
      payload: { error: { message: "bad request" } }
    });
    await expect(failedRequest).rejects.toBeInstanceOf(ProviderRequestError);
    await expect(failedRequest).rejects.toThrow(
      "Provider request failed with 400: bad request"
    );
  });
});
