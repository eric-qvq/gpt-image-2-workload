// @vitest-environment node

import { describe, expect, it } from "vitest";

import {
  getSessionFromCookieHeader,
  requireAdminRequest,
  requireMemberRequest
} from "../../src/server/auth/request-session";
import { createSessionToken } from "../../src/server/auth/session";

const secret = "test-secret-with-at-least-32-characters";

function requestWithCookie(cookie?: string): Request {
  return new Request("http://localhost/api/test", {
    headers: cookie ? { cookie } : {}
  });
}

describe("request session helpers", () => {
  it("reads a signed session token from a cookie header", async () => {
    process.env.AUTH_SECRET = secret;
    const token = await createSessionToken({ userId: "user_1", role: "MEMBER" }, secret);

    await expect(
      getSessionFromCookieHeader(`theme=dark; session=${token}; other=1`)
    ).resolves.toEqual({
      userId: "user_1",
      role: "MEMBER"
    });
  });

  it("requires a member or admin session for member requests", async () => {
    process.env.AUTH_SECRET = secret;
    const token = await createSessionToken({ userId: "admin_1", role: "ADMIN" }, secret);

    await expect(requireMemberRequest(requestWithCookie(`session=${token}`))).resolves.toEqual({
      userId: "admin_1",
      role: "ADMIN"
    });
  });

  it("rejects missing sessions and non-admin admin requests", async () => {
    process.env.AUTH_SECRET = secret;
    const token = await createSessionToken({ userId: "user_1", role: "MEMBER" }, secret);

    await expect(requireMemberRequest(requestWithCookie())).rejects.toMatchObject({
      status: 401
    });
    await expect(requireAdminRequest(requestWithCookie(`session=${token}`))).rejects.toMatchObject({
      status: 403
    });
  });
});
