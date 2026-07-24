import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { requireAdmin, requireMember } from "./guards";
import { getSessionFromToken } from "./request-session";
import type { Session } from "./session";

async function readPageSession(): Promise<Session | null> {
  const cookieStore = await cookies();

  return getSessionFromToken(cookieStore.get("session")?.value);
}

export async function requireMemberPageSession(): Promise<Session> {
  try {
    return requireMember(await readPageSession());
  } catch {
    redirect("/login");
  }
}

export async function requireAdminPageSession(): Promise<Session> {
  try {
    return requireAdmin(await readPageSession());
  } catch {
    redirect("/login");
  }
}
