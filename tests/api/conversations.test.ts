// @vitest-environment node

import { describe, expect, it, vi } from "vitest";

import { POST as createConversation } from "../../src/app/api/conversations/route";
import { POST as createMessage } from "../../src/app/api/conversations/[conversationId]/messages/route";
import { createSessionToken } from "../../src/server/auth/session";

const secret = "test-secret-with-at-least-32-characters";

const mocks = vi.hoisted(() => ({
  conversationCreate: vi.fn(async ({ data }) => ({
    id: "conversation_1",
    createdAt: new Date("2026-04-27T00:00:00Z"),
    updatedAt: new Date("2026-04-27T00:00:00Z"),
    ...data
  })),
  conversationFindFirst: vi.fn(async () => ({
    id: "conversation_1",
    userId: "user_1",
    title: "Campaign images"
  })),
  messageCreate: vi.fn(async ({ data }) => ({
    id: "message_1",
    createdAt: new Date("2026-04-27T00:00:00Z"),
    updatedAt: new Date("2026-04-27T00:00:00Z"),
    ...data
  })),
  generationJobCreate: vi.fn(async ({ data }) => ({
    id: "job_1",
    status: "QUEUED",
    error: null,
    retryCount: 0,
    upstreamResponse: null,
    createdAt: new Date("2026-04-27T00:00:00Z"),
    updatedAt: new Date("2026-04-27T00:00:00Z"),
    ...data
  })),
  transaction: vi.fn(async (callback) =>
    callback({
      message: { create: mocks.messageCreate },
      generationJob: { create: mocks.generationJobCreate }
    })
  )
}));

vi.mock("../../src/server/db/client", () => ({
  prisma: {
    conversation: {
      create: mocks.conversationCreate,
      findFirst: mocks.conversationFindFirst
    },
    message: { create: mocks.messageCreate },
    generationJob: { create: mocks.generationJobCreate },
    $transaction: mocks.transaction
  }
}));

function request(url: string, body: unknown, token: string): Request {
  return new Request(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      cookie: `session=${token}`
    },
    body: JSON.stringify(body)
  });
}

describe("conversation APIs", () => {
  it("creates conversations and queued generation jobs for member prompts", async () => {
    process.env.AUTH_SECRET = secret;
    const token = await createSessionToken({ userId: "user_1", role: "MEMBER" }, secret);

    const conversationResponse = await createConversation(
      request("http://localhost/api/conversations", { title: "Campaign images" }, token)
    );
    const conversationBody = await conversationResponse.json();

    expect(conversationResponse.status).toBe(201);
    expect(conversationBody.conversation).toMatchObject({
      userId: "user_1",
      title: "Campaign images"
    });

    const messageResponse = await createMessage(
      request(
        "http://localhost/api/conversations/conversation_1/messages",
        {
          prompt: "Draw a red cube",
          providerId: "provider_1",
          modelId: "model_1",
          requestParams: { size: "1024x1024" }
        },
        token
      ),
      { params: { conversationId: "conversation_1" } }
    );
    const messageBody = await messageResponse.json();

    expect(messageResponse.status).toBe(201);
    expect(mocks.conversationFindFirst).toHaveBeenCalledWith({
      where: {
        id: "conversation_1",
        userId: "user_1"
      }
    });
    expect(messageBody.job).toMatchObject({
      id: "job_1",
      status: "QUEUED"
    });
  });
});
