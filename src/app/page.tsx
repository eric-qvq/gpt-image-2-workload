import React from "react";

import {
  AuthenticatedAppShell,
  getAuthenticatedShellContext
} from "../components/layout/AuthenticatedAppShell";
import { OverviewContent } from "../components/overview/OverviewContent";
import { requireMemberPageSession } from "../server/auth/page-session";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await requireMemberPageSession();
  const shellContext = await getAuthenticatedShellContext({ session });

  return (
    <AuthenticatedAppShell context={shellContext}>
      <OverviewContent />
    </AuthenticatedAppShell>
  );
}
