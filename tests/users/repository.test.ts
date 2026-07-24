// @vitest-environment node

import { describe, expect, it, vi } from "vitest";

import { getAccountSummary } from "../../src/server/users/repository";

describe("user repository", () => {
  it("returns only safe account fields for the session user", async () => {
    const db = {
      user: {
        findUnique: vi.fn(async () => ({
          account: "admin",
          email: "admin@example.com"
        }))
      }
    };

    await expect(getAccountSummary("user_1", { db })).resolves.toEqual({
      account: "admin",
      email: "admin@example.com"
    });
    expect(db.user.findUnique).toHaveBeenCalledWith({
      where: { id: "user_1" },
      select: { account: true, email: true }
    });
  });

  it("returns null when the user record is unavailable", async () => {
    const db = { user: { findUnique: vi.fn(async () => null) } };

    await expect(getAccountSummary("missing", { db })).resolves.toBeNull();
  });
});
