// @vitest-environment node

import { describe, expect, it, vi } from "vitest";

import {
  DEFAULT_ADMIN_ACCOUNT,
  DEFAULT_ADMIN_EMAIL,
  DEFAULT_ADMIN_PASSWORD,
  seedDefaultAdmin
} from "../../src/server/auth/admin-seed";

describe("default admin seed", () => {
  it("creates an active admin user without storing the plain password", async () => {
    const hashPassword = vi.fn(async () => "hashed-admin-password");
    const db = {
      user: {
        upsert: vi.fn(async ({ create }) => ({
          id: "user_admin",
          ...create
        }))
      }
    };

    const user = await seedDefaultAdmin({ db, hashPassword });

    expect(hashPassword).toHaveBeenCalledWith(DEFAULT_ADMIN_PASSWORD);
    expect(db.user.upsert).toHaveBeenCalledWith({
      where: { email: DEFAULT_ADMIN_EMAIL },
      update: {
        account: DEFAULT_ADMIN_ACCOUNT,
        role: "ADMIN",
        status: "ACTIVE"
      },
      create: {
        account: DEFAULT_ADMIN_ACCOUNT,
        email: DEFAULT_ADMIN_EMAIL,
        passwordHash: "hashed-admin-password",
        role: "ADMIN",
        status: "ACTIVE"
      }
    });
    expect(user.passwordHash).toBe("hashed-admin-password");
    expect(user.passwordHash).not.toBe(DEFAULT_ADMIN_PASSWORD);
  });
});
