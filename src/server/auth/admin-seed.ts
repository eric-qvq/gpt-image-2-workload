import { prisma } from "../db/client";
import { hashPassword as defaultHashPassword } from "./password";

export const DEFAULT_ADMIN_ACCOUNT = "admin";
export const DEFAULT_ADMIN_EMAIL = "admin@example.com";
export const DEFAULT_ADMIN_PASSWORD = "admin123456";

type AdminUser = {
  id: string;
  account: string;
  email: string;
  passwordHash: string;
  role: "ADMIN" | "MEMBER";
  status: "ACTIVE" | "DISABLED";
};

type AdminSeedDb = {
  user: {
    upsert(args: {
      where: { email: string };
      update: {
        account: string;
        role: "ADMIN";
        status: "ACTIVE";
      };
      create: {
        account: string;
        email: string;
        passwordHash: string;
        role: "ADMIN";
        status: "ACTIVE";
      };
    }): Promise<AdminUser>;
  };
};

type SeedDefaultAdminContext = {
  db?: AdminSeedDb;
  hashPassword?: (password: string) => Promise<string>;
};

export async function seedDefaultAdmin({
  db,
  hashPassword = defaultHashPassword
}: SeedDefaultAdminContext = {}): Promise<AdminUser> {
  const resolvedDb = db ?? (prisma as unknown as AdminSeedDb);
  const passwordHash = await hashPassword(DEFAULT_ADMIN_PASSWORD);

  return resolvedDb.user.upsert({
    where: { email: DEFAULT_ADMIN_EMAIL },
    update: {
      account: DEFAULT_ADMIN_ACCOUNT,
      role: "ADMIN",
      status: "ACTIVE"
    },
    create: {
      account: DEFAULT_ADMIN_ACCOUNT,
      email: DEFAULT_ADMIN_EMAIL,
      passwordHash,
      role: "ADMIN",
      status: "ACTIVE"
    }
  });
}
