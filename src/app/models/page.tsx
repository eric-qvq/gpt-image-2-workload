import React from "react";

import { ProviderEditForm } from "../../components/admin/ProviderEditForm";
import { ProviderForm } from "../../components/admin/ProviderForm";
import { ProviderModelForm } from "../../components/admin/ProviderModelForm";
import { LocalizedPageHeading } from "../../components/i18n/LocalizedPageHeading";
import {
  AuthenticatedAppShell,
  getAuthenticatedShellContext
} from "../../components/layout/AuthenticatedAppShell";
import { ModelCatalog } from "../../components/models/ModelCatalog";
import { ProviderList } from "../../components/models/ProviderList";
import { requireMemberPageSession } from "../../server/auth/page-session";
import {
  listGenerationOptions,
  listProviders
} from "../../server/providers/repository";

export const dynamic = "force-dynamic";

export default async function ModelsPage() {
  const session = await requireMemberPageSession();
  const optionsPromise = listGenerationOptions().catch(() => ({
    providers: [],
    models: []
  }));
  const providersPromise =
    session.role === "ADMIN"
      ? listProviders().catch(() => [])
      : Promise.resolve([]);
  const [options, providers] = await Promise.all([
    optionsPromise,
    providersPromise
  ]);
  const shellContext = await getAuthenticatedShellContext({
    session,
    generationOptions: options
  });
  const providerNames = new Map(
    options.providers.map((provider) => [provider.id, provider.name])
  );
  const catalogModels = options.models.map((model) => ({
    id: model.id,
    providerId: model.providerId,
    providerName: providerNames.get(model.providerId) ?? "Provider",
    name: model.name
  }));

  return (
    <AuthenticatedAppShell context={shellContext}>
      <LocalizedPageHeading
        id="models-title"
        copy={{
          en: {
            eyebrow: "Configuration",
            title: "Models",
            description:
              "Review enabled image models. Administrators can manage the connected provider configuration below."
          },
          zh: {
            eyebrow: "配置",
            title: "模型",
            description: "查看已启用的图像模型。管理员可在下方管理已连接的服务商配置。"
          }
        }}
      />

      <ModelCatalog
        models={catalogModels}
        currentModelId={options.models[0]?.id}
      />

      {session.role === "ADMIN" ? (
        <>
          <ProviderList
            providers={providers.map((provider) => ({
              id: provider.id,
              name: provider.name,
              type: provider.type,
              baseUrl: provider.baseUrl,
              enabled: provider.enabled
            }))}
          />
          <div className="admin-grid">
            <ProviderForm />
            <ProviderEditForm providers={providers} />
            <ProviderModelForm providers={providers} />
          </div>
        </>
      ) : null}
    </AuthenticatedAppShell>
  );
}
