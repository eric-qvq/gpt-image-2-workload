// @vitest-environment node

import { describe, expect, it, vi } from "vitest";

import { POST } from "../../src/app/api/login/route";
import { verifySessionToken } from "../../src/server/auth/session";

const secret = "test-secret-with-at-least-32-characters";

const mocks = vi.hoisted(() => ({
  userFindFirst: vi.fn(),
  verifyPassword: vi.fn()
}));

vi.mock("../../src/server/db/client", () => ({
  prisma: {
    user: {
      findFirst: mocks.userFindFirst
    }
  }
}));

vi.mock("../../src/server/auth/password", () => ({
  verifyPassword: mocks.verifyPassword
}));

function loginRequest(body: unknown): Request {
  return new Request("http://localhost/api/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });
}

describe("login API", () => {
  it("sets a session cookie for valid active users", async () => {
    process.env.AUTH_SECRET = secret;
    mocks.userFindFirst.mockResolvedValueOnce({
      id: "user_admin",
      account: "admin",
      email: "admin@example.com",
      passwordHash: "hashed-password",
      role: "ADMIN",
      status: "ACTIVE"
    });
    mocks.verifyPassword.mockResolvedValueOnce(true);

    const response = await POST(
      loginRequest({
        account: "admin@example.com",
        password: "admin123456"
      })
    );
    const body = await response.json();
    const cookie = response.headers.get("set-cookie") ?? "";
    const token = cookie.match(/session=([^;]+)/)?.[1];

    expect(response.status).toBe(200);
    expect(body.user).toMatchObject({
      id: "user_admin",
      account: "admin",
      email: "admin@example.com",
      role: "ADMIN"
    });
    expect(body.user).not.toHaveProperty("passwordHash");
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("Path=/");
    expect(token).toBeTruthy();
    await expect(verifySessionToken(token ?? "", secret)).resolves.toMatchObject({
      userId: "user_admin",
      role: "ADMIN"
    });
  });

  it("rejects invalid credentials", async () => {
    process.env.AUTH_SECRET = secret;
    mocks.userFindFirst.mockResolvedValueOnce({
      id: "user_admin",
      account: "admin",
      email: "admin@example.com",
      passwordHash: "hashed-password",
      role: "ADMIN",
      status: "ACTIVE"
    });
    mocks.verifyPassword.mockResolvedValueOnce(false);

    const response = await POST(
      loginRequest({
        account: "admin@example.com",
        password: "wrong-password"
      })
    );

    expect(response.status).toBe(401);
    expect(response.headers.get("set-cookie")).toBeNull();
  });
});
