import React from "react";

import {
  AuthenticatedAppShell,
  getAuthenticatedShellContext
} from "../../components/layout/AuthenticatedAppShell";
import { BatchJobsPreview } from "../../components/prototype/BatchJobsPreview";
import { requireMemberPageSession } from "../../server/auth/page-session";

export const dynamic = "force-dynamic";

export default async function BatchJobsPage() {
  const session = await requireMemberPageSession();
  const shellContext = await getAuthenticatedShellContext({ session });

  return (
    <AuthenticatedAppShell context={shellContext}>
      <BatchJobsPreview />
    </AuthenticatedAppShell>
  );
}
