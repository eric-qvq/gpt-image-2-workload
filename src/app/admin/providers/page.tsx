import { redirect } from "next/navigation";

import { requireAdminPageSession } from "../../../server/auth/page-session";

export const dynamic = "force-dynamic";

export default async function AdminProvidersPage() {
  await requireAdminPageSession();
  redirect("/models");
}
