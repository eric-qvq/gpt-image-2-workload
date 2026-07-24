import React from "react";

import {
  AuthenticatedAppShell,
  getAuthenticatedShellContext
} from "../../components/layout/AuthenticatedAppShell";
import { DatasetPreview } from "../../components/prototype/DatasetPreview";
import { requireMemberPageSession } from "../../server/auth/page-session";

export const dynamic = "force-dynamic";

export default async function DatasetPage() {
  const session = await requireMemberPageSession();
  const shellContext = await getAuthenticatedShellContext({ session });

  return (
    <AuthenticatedAppShell context={shellContext}>
      <DatasetPreview />
    </AuthenticatedAppShell>
  );
}
