// @vitest-environment node

import { describe, expect, it, vi } from "vitest";

import {
  createModel,
  createProvider,
  listGenerationOptions,
  listModelsForProvider,
  listProviders
} from "../../src/server/providers/repository";

const encryptionKey = Buffer.from("0123456789abcdef0123456789abcdef").toString("base64");

function createMockDb() {
  return {
    provider: {
      create: vi.fn(async ({ data }) => ({
        id: "provider_1",
        createdAt: new Date("2026-04-27T00:00:00Z"),
        updatedAt: new Date("2026-04-27T00:00:00Z"),
        ...data
      })),
      findMany: vi.fn(async () => [
        {
          id: "provider_1",
          name: "Proxy",
          type: "OPENAI_COMPATIBLE" as const,
          baseUrl: "https://api.example.com/v1",
          encryptedApiKey: "encrypted",
          enabled: true,
          createdAt: new Date("2026-04-27T00:00:00Z"),
          updatedAt: new Date("2026-04-27T00:00:00Z")
        }
      ])
    },
    imageModel: {
      create: vi.fn(async ({ data }) => ({
        id: "model_1",
        createdAt: new Date("2026-04-27T00:00:00Z"),
        updatedAt: new Date("2026-04-27T00:00:00Z"),
        ...data
      })),
      findMany: vi.fn(async ({ where }) => [
        {
          id: "model_1",
          providerId: where.providerId,
          name: "gpt-image-2",
          defaultParams: { size: "1024x1024" },
          capabilities: { referenceImages: true },
          enabled: true,
          createdAt: new Date("2026-04-27T00:00:00Z"),
          updatedAt: new Date("2026-04-27T00:00:00Z")
        }
      ])
    }
  };
}

describe("provider repository", () => {
  it("encrypts keys when creating providers and omits encrypted keys from responses", async () => {
    const db = createMockDb();

    const provider = await createProvider(
      {
        name: "Proxy",
        type: "OPENAI_COMPATIBLE",
        baseUrl: "https://api.example.com/v1",
        apiKey: "sk-test-key",
        enabled: true
      },
      { db, encryptionKey }
    );

    expect(db.provider.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        encryptedApiKey: expect.not.stringContaining("sk-test-key")
      })
    });
    expect(provider).not.toHaveProperty("encryptedApiKey");

    const providers = await listProviders({ db });

    expect(providers[0]).not.toHaveProperty("encryptedApiKey");
  });

  it("creates and lists models for a provider", async () => {
    const db = createMockDb();

    const model = await createModel(
      "provider_1",
      {
        name: "gpt-image-2",
        defaultParams: { size: "1024x1024" },
        capabilities: { referenceImages: true },
        enabled: true
      },
      { db }
    );

    expect(db.imageModel.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        providerId: "provider_1",
        name: "gpt-image-2"
      })
    });
    expect(model.name).toBe("gpt-image-2");

    const models = await listModelsForProvider("provider_1", { db });

    expect(models).toHaveLength(1);
    expect(models[0].name).toBe("gpt-image-2");
  });

  it("lists enabled providers and models for generation controls", async () => {
    const db = {
      provider: {
        findMany: vi.fn(async () => [
          {
            id: "provider_1",
            name: "Proxy",
            type: "OPENAI_COMPATIBLE" as const,
            baseUrl: "https://api.example.com/v1",
            encryptedApiKey: "encrypted",
            enabled: true,
            createdAt: new Date("2026-04-27T00:00:00Z"),
            updatedAt: new Date("2026-04-27T00:00:00Z"),
            imageModels: [
              {
                id: "model_1",
                providerId: "provider_1",
                name: "gpt-image-2",
                defaultParams: { size: "1024x1024" },
                capabilities: { referenceImages: true },
                enabled: true,
                createdAt: new Date("2026-04-27T00:00:00Z"),
                updatedAt: new Date("2026-04-27T00:00:00Z")
              }
            ]
          }
        ])
      }
    };

    const options = await listGenerationOptions({ db });

    expect(db.provider.findMany).toHaveBeenCalledWith({
      where: { enabled: true },
      include: {
        imageModels: {
          where: { enabled: true },
          orderBy: { createdAt: "desc" }
        }
      },
      orderBy: { createdAt: "desc" }
    });
    expect(options).toEqual({
      providers: [{ id: "provider_1", name: "Proxy" }],
      models: [
        {
          id: "model_1",
          providerId: "provider_1",
          name: "gpt-image-2",
          defaultParams: { size: "1024x1024" },
          capabilities: { referenceImages: true }
        }
      ]
    });
  });
});
