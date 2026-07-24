// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from "vitest";

import AdminProvidersPage, {
  dynamic
} from "../../src/app/admin/providers/page";

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

describe("AdminProvidersPage compatibility route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.cookieGet.mockReturnValue({ value: "session-token" });
    mocks.cookies.mockResolvedValue({ get: mocks.cookieGet });
    mocks.getSessionFromToken.mockResolvedValue({
      userId: "user_admin",
      role: "ADMIN"
    });
    mocks.redirect.mockImplementation(() => {
      throw new Error("NEXT_REDIRECT");
    });
  });

  it("redirects admins to the role-aware Models page", async () => {
    expect(dynamic).toBe("force-dynamic");

    await expect(
      Promise.resolve().then(() => AdminProvidersPage())
    ).rejects.toThrow("NEXT_REDIRECT");

    expect(mocks.cookieGet).toHaveBeenCalledWith("session");
    expect(mocks.getSessionFromToken).toHaveBeenCalledWith("session-token");
    expect(mocks.redirect).toHaveBeenCalledWith("/models");
  });

  it("redirects members to login before the compatibility redirect", async () => {
    mocks.getSessionFromToken.mockResolvedValue({
      userId: "user_member",
      role: "MEMBER"
    });

    await expect(
      Promise.resolve().then(() => AdminProvidersPage())
    ).rejects.toThrow("NEXT_REDIRECT");

    expect(mocks.redirect).toHaveBeenCalledTimes(1);
    expect(mocks.redirect).toHaveBeenCalledWith("/login");
  });

  it("redirects missing sessions to login before the compatibility redirect", async () => {
    mocks.cookieGet.mockReturnValue(undefined);
    mocks.getSessionFromToken.mockResolvedValue(null);

    await expect(
      Promise.resolve().then(() => AdminProvidersPage())
    ).rejects.toThrow("NEXT_REDIRECT");

    expect(mocks.getSessionFromToken).toHaveBeenCalledWith(undefined);
    expect(mocks.redirect).toHaveBeenCalledTimes(1);
    expect(mocks.redirect).toHaveBeenCalledWith("/login");
  });
});
