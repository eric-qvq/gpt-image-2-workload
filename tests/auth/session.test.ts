// @vitest-environment node

import { describe, expect, it } from "vitest";

import { createSessionToken, verifySessionToken } from "../../src/server/auth/session";

const secret = "test-secret-with-at-least-32-characters";

describe("session utilities", () => {
  it("creates verifiable session tokens", async () => {
    const token = await createSessionToken(
      { userId: "user_123", role: "ADMIN" },
      secret
    );

    const session = await verifySessionToken(token, secret);

    expect(session).toMatchObject({ userId: "user_123", role: "ADMIN" });
  });

  it("rejects tampered session tokens", async () => {
    const token = await createSessionToken(
      { userId: "user_123", role: "MEMBER" },
      secret
    );

    const tamperedToken = `${token.slice(0, -1)}x`;

    await expect(verifySessionToken(tamperedToken, secret)).rejects.toThrow(
      "Invalid session token"
    );
  });
});
