// @vitest-environment node

import { describe, expect, it, vi } from "vitest";

import { listHistoryAssets } from "../../src/server/history/assets";

describe("history assets", () => {
  it("maps current member image assets for the history grid", async () => {
    const db = {
      imageAsset: {
        findMany: vi.fn(async () => [
          {
            id: "asset_1",
            createdAt: new Date("2026-04-27T00:00:00Z"),
            job: {
              userId: "user_1",
              prompt: "Draw a red cube",
              providerId: "provider_1",
              modelId: "model_1",
              requestParams: {
                size: "1024x1024",
                count: 1,
                debug: { ignored: true }
              },
              model: {
                name: "gpt-image-2"
              }
            }
          }
        ]),
        count: vi.fn(async () => 1)
      }
    };

    const assets = await listHistoryAssets(
      { userId: "user_1", role: "MEMBER" },
      {},
      { db }
    );

    expect(db.imageAsset.findMany).toHaveBeenCalledWith({
      where: {
        job: {
          userId: "user_1"
        }
      },
      include: {
        job: {
          include: {
            model: true
          }
        }
      },
      orderBy: { createdAt: "desc" },
      take: 50,
      skip: 0
    });
    expect(assets).toEqual([
      {
        id: "asset_1",
        src: "/api/image-assets/asset_1",
        prompt: "Draw a red cube",
        providerId: "provider_1",
        modelId: "model_1",
        model: "gpt-image-2",
        createdAt: "2026-04-27T00:00:00.000Z",
        requestParams: {
          size: "1024x1024",
          count: 1
        }
      }
    ]);
  });
});
