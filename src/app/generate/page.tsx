import React from "react";

import { GenerateWorkspace } from "../../components/generate/GenerateWorkspace";
import { RecentGenerations } from "../../components/generate/RecentGenerations";
import { TodaysUsage } from "../../components/generate/TodaysUsage";
import { LocalizedPageHeading } from "../../components/i18n/LocalizedPageHeading";
import {
  AuthenticatedAppShell,
  getAuthenticatedShellContext
} from "../../components/layout/AuthenticatedAppShell";
import { requireMemberPageSession } from "../../server/auth/page-session";
import { listHistoryAssets } from "../../server/history/assets";
import { listGenerationOptions } from "../../server/providers/repository";

export const dynamic = "force-dynamic";

type GeneratePageProps = {
  searchParams?: Promise<{
    prompt?: string;
    providerId?: string;
    modelId?: string;
    size?: string;
    count?: string;
    quality?: string;
    responseFormat?: string;
  }>;
};

function readCount(value: string | undefined): number {
  const count = Number(value ?? 1);

  return Number.isFinite(count) && count > 0 ? count : 1;
}

function readResponseFormat(
  value: string | undefined
): "url" | "b64_json" | undefined {
  return value === "url" || value === "b64_json" ? value : undefined;
}

function readQuality(
  value: string | undefined
): "standard" | "high" | undefined {
  return value === "standard" || value === "high" ? value : undefined;
}

export default async function GeneratePage({ searchParams }: GeneratePageProps) {
  const session = await requireMemberPageSession();
  const params = searchParams ? await searchParams : {};
  const [options, recentAssets] = await Promise.all([
    listGenerationOptions().catch(() => ({
      providers: [],
      models: []
    })),
    listHistoryAssets(session, { limit: 6, offset: 0 }).catch(() => [])
  ]);
  const shellContext = await getAuthenticatedShellContext({
    session,
    generationOptions: options
  });

  return (
    <AuthenticatedAppShell context={shellContext}>
      <div className="create-page-layout">
        <LocalizedPageHeading
          id="generate-title"
          className="create-page-heading"
          copy={{
            en: {
              eyebrow: "Workbench",
              title: "Create Image",
              description:
                "Submit a prompt, let the worker call your configured provider, and view archived outputs when they are ready."
            },
            zh: {
              eyebrow: "工作台",
              title: "创建图像",
              description: "提交提示词，由工作进程调用已配置的服务商，并在完成后查看归档结果。"
            }
          }}
        />
        <GenerateWorkspace
          providers={options.providers}
          models={options.models}
          initialPrompt={params.prompt ?? ""}
          initialPreviewAsset={recentAssets[0]}
          initialParameters={{
            providerId: params.providerId,
            modelId: params.modelId,
            size: params.size,
            count: readCount(params.count),
            quality: readQuality(params.quality),
            responseFormat: readResponseFormat(params.responseFormat)
          }}
        />
        <div className="create-lower-grid">
          <RecentGenerations assets={recentAssets} />
          <TodaysUsage />
        </div>
      </div>
    </AuthenticatedAppShell>
  );
}
