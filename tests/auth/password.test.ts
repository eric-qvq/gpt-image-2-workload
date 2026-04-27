// @vitest-environment node

import { describe, expect, it } from "vitest";

import { hashPassword, verifyPassword } from "../../src/server/auth/password";

describe("password utilities", () => {
  it("hashes passwords without storing the plain text", async () => {
    const hash = await hashPassword("secret");

    expect(hash).not.toBe("secret");
    expect(hash.length).toBeGreaterThan(20);
  });

  it("verifies matching passwords and rejects wrong passwords", async () => {
    const hash = await hashPassword("secret");

    await expect(verifyPassword("secret", hash)).resolves.toBe(true);
    await expect(verifyPassword("wrong-password", hash)).resolves.toBe(false);
  });
});
