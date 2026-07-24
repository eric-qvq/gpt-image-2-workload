import React from "react";

import {
  AuthenticatedAppShell,
  getAuthenticatedShellContext
} from "../../components/layout/AuthenticatedAppShell";
import { UsagePreview } from "../../components/prototype/UsagePreview";
import { requireMemberPageSession } from "../../server/auth/page-session";

export const dynamic = "force-dynamic";

export default async function UsagePage() {
  const session = await requireMemberPageSession();
  const shellContext = await getAuthenticatedShellContext({ session });

  return (
    <AuthenticatedAppShell context={shellContext}>
      <UsagePreview />
    </AuthenticatedAppShell>
  );
}
