// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  requireAdminPageSession,
  requireMemberPageSession
} from "../../src/server/auth/page-session";

const mocks = vi.hoisted(() => ({
  cookieGet: vi.fn(),
  cookies: vi.fn(),
  getSessionFromToken: vi.fn(),
  redirect: vi.fn()
}));

vi.mock("next/headers", () => ({
  cookies: mocks.cookies
}));

vi.mock("next/navigation", () => ({
  redirect: mocks.redirect
}));

vi.mock("../../src/server/auth/request-session", () => ({
  getSessionFromToken: mocks.getSessionFromToken
}));

describe("page session guards", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.cookieGet.mockReturnValue({ value: "session-token" });
    mocks.cookies.mockResolvedValue({ get: mocks.cookieGet });
    mocks.getSessionFromToken.mockResolvedValue({
      userId: "user_member",
      role: "MEMBER"
    });
    mocks.redirect.mockImplementation(() => {
      throw new Error("NEXT_REDIRECT");
    });
  });

  it("returns a member session from the session cookie", async () => {
    await expect(requireMemberPageSession()).resolves.toEqual({
      userId: "user_member",
      role: "MEMBER"
    });
    expect(mocks.cookieGet).toHaveBeenCalledWith("session");
    expect(mocks.getSessionFromToken).toHaveBeenCalledWith("session-token");
  });

  it("returns an administrator session for an admin page", async () => {
    mocks.getSessionFromToken.mockResolvedValue({
      userId: "user_admin",
      role: "ADMIN"
    });

    await expect(requireAdminPageSession()).resolves.toEqual({
      userId: "user_admin",
      role: "ADMIN"
    });
  });

  it("redirects a member away from an admin page", async () => {
    await expect(requireAdminPageSession()).rejects.toThrow("NEXT_REDIRECT");
    expect(mocks.redirect).toHaveBeenCalledWith("/login");
  });

  it("redirects a missing session away from a member page", async () => {
    mocks.cookieGet.mockReturnValue(undefined);
    mocks.getSessionFromToken.mockResolvedValue(null);

    await expect(requireMemberPageSession()).rejects.toThrow("NEXT_REDIRECT");
    expect(mocks.getSessionFromToken).toHaveBeenCalledWith(undefined);
    expect(mocks.redirect).toHaveBeenCalledWith("/login");
  });
});
