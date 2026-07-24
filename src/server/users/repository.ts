import { prisma } from "../db/client";

type AccountRecord = {
  account: string;
  email: string;
};

type UserDb = {
  user: {
    findUnique(args: {
      where: { id: string };
      select: { account: true; email: true };
    }): Promise<AccountRecord | null>;
  };
};

export async function getAccountSummary(
  userId: string,
  context: { db?: UserDb } = {}
): Promise<AccountRecord | null> {
  const db = (context.db ?? prisma) as UserDb;

  return db.user.findUnique({
    where: { id: userId },
    select: { account: true, email: true }
  });
}
