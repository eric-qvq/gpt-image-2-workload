import React, { type ReactNode } from "react";

import type { Session } from "../../server/auth/session";
import { listGenerationOptions } from "../../server/providers/repository";
import { getAccountSummary } from "../../server/users/repository";
import { AppShell } from "./AppShell";

type GenerationOptions = Awaited<ReturnType<typeof listGenerationOptions>>;

export type AuthenticatedShellContext = {
  role: Session["role"];
  accountLabel: string;
  accountEmail?: string;
  initialModelName: string;
};

export async function getAuthenticatedShellContext({
  session,
  generationOptions
}: {
  session: Session;
  generationOptions?: GenerationOptions;
}): Promise<AuthenticatedShellContext> {
  const [account, options] = await Promise.all([
    getAccountSummary(session.userId).catch(() => null),
    generationOptions
      ? Promise.resolve(generationOptions)
      : listGenerationOptions().catch(() => ({ providers: [], models: [] }))
  ]);
  const providerNames = new Map(
    options.providers.map((provider) => [provider.id, provider.name])
  );
  const initialModel = options.models[0];

  return {
    role: session.role,
    accountLabel: account?.account ?? session.role,
    accountEmail: account?.email,
    initialModelName: initialModel
      ? `${providerNames.get(initialModel.providerId) ?? "Provider"} / ${initialModel.name}`
      : "Not connected"
  };
}

export function AuthenticatedAppShell({
  children,
  context
}: {
  children: ReactNode;
  context: AuthenticatedShellContext;
}) {
  return (
    <AppShell
      role={context.role}
      accountLabel={context.accountLabel}
      accountEmail={context.accountEmail}
      initialModelName={context.initialModelName}
    >
      {children}
    </AppShell>
  );
}
