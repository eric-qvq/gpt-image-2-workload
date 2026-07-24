import React from "react";

import {
  AuthenticatedAppShell,
  getAuthenticatedShellContext
} from "../../components/layout/AuthenticatedAppShell";
import { SettingsPreview } from "../../components/prototype/SettingsPreview";
import { requireMemberPageSession } from "../../server/auth/page-session";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await requireMemberPageSession();
  const shellContext = await getAuthenticatedShellContext({ session });

  return (
    <AuthenticatedAppShell context={shellContext}>
      <SettingsPreview
        account={shellContext.accountLabel}
        email={shellContext.accountEmail}
        role={shellContext.role}
      />
    </AuthenticatedAppShell>
  );
}
