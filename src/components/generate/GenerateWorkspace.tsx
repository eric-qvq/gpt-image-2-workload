"use client";

import React, { useEffect, useState } from "react";

import {
  GenerationChat,
  type ChatMessage
} from "../chat/GenerationChat";
import { useLocalizedCopy } from "../i18n/localization";
import { useShellState } from "../layout/ShellState";
import { ParameterPanel } from "../settings/ParameterPanel";
import { CreateToolbar } from "./CreateToolbar";
import type { PreviewAsset } from "./ImagePreview";
import {
  defaultPrototypeParameters,
  type ConnectedGenerationParameters,
  type ModelOption,
  type ProviderOption,
  type PrototypeGenerationParameters
} from "./types";

type GenerateWorkspaceProps = {
  providers: ProviderOption[];
  models: ModelOption[];
  initialPrompt?: string;
  initialPreviewAsset?: PreviewAsset;
  initialParameters?: Partial<ConnectedGenerationParameters>;
  pollIntervalMs?: number;
  maxPollAttempts?: number;
};

type JobResponse = {
  job: {
    id: string;
    status: string;
    error?: string | null;
    imageAssets?: Array<{ id: string }>;
  };
};

const terminalStatuses = new Set([
  "FAILED",
  "CANCELED",
  "ARCHIVED",
  "ARCHIVE_FAILED"
]);
const generationPromptFormId = "generation-prompt-form";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function readError(body: unknown, fallback: string): string {
  return typeof body === "object" &&
    body !== null &&
    "error" in body &&
    typeof body.error === "string"
    ? body.error
    : fallback;
}

function toChatStatus(status: string): ChatMessage["status"] {
  if (status === "FAILED" || status === "CANCELED" || status === "ARCHIVE_FAILED") {
    return "failed";
  }

  if (status === "RUNNING" || status === "SUCCEEDED") {
    return "running";
  }

  if (status === "ARCHIVED") {
    return "succeeded";
  }

  return "queued";
}

type JobMessageCopy = {
  providerUrlHint: string;
  ready: string;
  archiving: string;
  status: (jobId: string, status: string) => string;
};

function buildJobMessage(
  job: JobResponse["job"],
  text: JobMessageCopy
): string {
  if (job.error) {
    if (job.error.includes("text/html")) {
      return `${job.error} ${text.providerUrlHint}`;
    }

    return job.error;
  }

  if (job.status === "ARCHIVED") {
    return text.ready;
  }

  if (job.status === "SUCCEEDED") {
    return text.archiving;
  }

  return text.status(job.id, job.status);
}

function resolveInitialParameters(
  providers: ProviderOption[],
  models: ModelOption[],
  initial: Partial<ConnectedGenerationParameters>
): ConnectedGenerationParameters {
  const requestedProviderId = providers.some(
    (provider) => provider.id === initial.providerId
  )
    ? initial.providerId ?? ""
    : "";
  const requestedModel = models.find((model) => model.id === initial.modelId);
  const selectedModel =
    requestedModel &&
    (!requestedProviderId || requestedModel.providerId === requestedProviderId)
      ? requestedModel
      : models.find((model) => model.providerId === requestedProviderId) ??
        models[0];
  const providerId =
    selectedModel?.providerId ?? requestedProviderId ?? providers[0]?.id ?? "";

  return {
    providerId,
    modelId: selectedModel?.id ?? "",
    size: initial.size ?? "1024x1024",
    count: initial.count ?? 1,
    quality: initial.quality ?? "standard",
    responseFormat: initial.responseFormat ?? "b64_json"
  };
}

async function parseJsonResponse<T>(
  response: Response,
  fallback: string
): Promise<T> {
  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(readError(body, fallback));
  }

  return body as T;
}

export function GenerateWorkspace({
  providers,
  models,
  initialPrompt = "",
  initialPreviewAsset,
  initialParameters = {},
  pollIntervalMs = 2000,
  maxPollAttempts = 60
}: GenerateWorkspaceProps) {
  const [connectedParameters, setConnectedParameters] =
    useState<ConnectedGenerationParameters>(() =>
      resolveInitialParameters(providers, models, initialParameters)
    );
  const [prototypeParameters, setPrototypeParameters] =
    useState<PrototypeGenerationParameters>(() => ({
      ...defaultPrototypeParameters
    }));
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const { setCurrentModelName } = useShellState();
  const text = useLocalizedCopy({
    en: {
      notConnected: "Not connected",
      noProvider:
        "No enabled provider found. Go to Models, add an OpenAI-compatible provider, and make sure it is enabled.",
      noModel:
        "No enabled model found. Go to Models and add a model such as gpt-image-2 for your provider.",
      selectProvider: "Select an enabled provider before generating.",
      selectModel: "Select an enabled model before generating.",
      providerUrlHint:
        "This usually means the provider Base URL is a website URL instead of the API root. Try an OpenAI-compatible URL ending in /v1, for example https://your-provider.example/v1.",
      ready: "Image ready.",
      archiving: "Provider completed; archiving images.",
      status: (jobId: string, status: string) =>
        `Job ${jobId} is ${status.toLowerCase()}.`,
      loadStatusError: "Could not load generation status.",
      submitting: "Submitting generation job...",
      configureFirst: "Configure an enabled provider and model before generating.",
      conversationError: "Could not create conversation.",
      queueError: "Could not queue generation job.",
      generationError: "Generation failed."
    },
    zh: {
      notConnected: "未连接",
      noProvider: "未找到已启用的服务商。请前往模型页面添加 OpenAI 兼容服务商，并确认已启用。",
      noModel: "未找到已启用的模型。请前往模型页面，为服务商添加例如 gpt-image-2 的模型。",
      selectProvider: "生成前请选择已启用的服务商。",
      selectModel: "生成前请选择已启用的模型。",
      providerUrlHint:
        "这通常表示服务商基础 URL 指向网站页面，而不是 API 根地址。请尝试以 /v1 结尾的 OpenAI 兼容地址，例如 https://your-provider.example/v1。",
      ready: "图像已就绪。",
      archiving: "服务商已完成生成，正在归档图像。",
      status: (jobId: string, status: string) =>
        `任务 ${jobId} 当前状态：${status.toLowerCase()}。`,
      loadStatusError: "无法加载生成状态。",
      submitting: "正在提交生成任务...",
      configureFirst: "请先配置并启用服务商和模型，再开始生成。",
      conversationError: "无法创建会话。",
      queueError: "无法加入生成队列。",
      generationError: "生成失败。"
    }
  });
  const selectedProvider = providers.find(
    (provider) => provider.id === connectedParameters.providerId
  );
  const selectedModel = models.find(
    (model) =>
      model.id === connectedParameters.modelId &&
      model.providerId === connectedParameters.providerId
  );
  const activeConfigLabel =
    selectedProvider && selectedModel
      ? `${selectedProvider.name} / ${selectedModel.name}`
      : undefined;

  useEffect(() => {
    setCurrentModelName(activeConfigLabel ?? text.notConnected);
  }, [activeConfigLabel, setCurrentModelName, text.notConnected]);

  const disabledReason = (() => {
    if (!providers.length) {
      return text.noProvider;
    }

    if (!models.length) {
      return text.noModel;
    }

    if (!connectedParameters.providerId || !selectedProvider) {
      return text.selectProvider;
    }

    if (!connectedParameters.modelId || !selectedModel) {
      return text.selectModel;
    }

    return undefined;
  })();

  function updateJobMessage(
    messageId: string,
    job: JobResponse["job"],
    prompt: string
  ) {
    setMessages((currentMessages) =>
      currentMessages.map((message) =>
        message.id === messageId
          ? {
              ...message,
              content: buildJobMessage(job, text),
              status: toChatStatus(job.status),
              images: job.imageAssets?.map((asset) => ({
                id: asset.id,
                src: `/api/image-assets/${asset.id}`,
                alt: prompt
              }))
            }
          : message
      )
    );
  }

  async function pollJob(jobId: string, messageId: string, prompt: string) {
    for (let attempt = 0; attempt < maxPollAttempts; attempt += 1) {
      await sleep(pollIntervalMs);
      const response = await fetch(`/api/generation-jobs/${jobId}`);
      const body = await parseJsonResponse<JobResponse>(
        response,
        text.loadStatusError
      );

      updateJobMessage(messageId, body.job, prompt);

      if (terminalStatuses.has(body.job.status)) {
        return;
      }
    }
  }

  function handleModelChange(modelId: string) {
    const model = models.find((candidate) => candidate.id === modelId);

    if (!model) return;

    setConnectedParameters((current) => ({
      ...current,
      providerId: model.providerId,
      modelId: model.id
    }));
  }

  function handleReset() {
    setConnectedParameters(resolveInitialParameters(providers, models, {}));
    setPrototypeParameters({ ...defaultPrototypeParameters });
  }

  async function handleSubmit(prompt: string) {
    const timestamp = Date.now();
    const assistantMessageId = `job-${timestamp}`;

    setMessages((currentMessages) => [
      ...currentMessages,
      { id: `user-${timestamp}`, role: "user", content: prompt },
      {
        id: assistantMessageId,
        role: "assistant",
        content: text.submitting,
        status: "queued"
      }
    ]);

    if (!connectedParameters.providerId || !connectedParameters.modelId) {
      updateJobMessage(
        assistantMessageId,
        {
          id: assistantMessageId,
          status: "FAILED",
          error:
            disabledReason ??
            text.configureFirst
        },
        prompt
      );
      return;
    }

    try {
      const conversationResponse = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: prompt.slice(0, 80) })
      });
      const { conversation } = await parseJsonResponse<{
        conversation: { id: string };
      }>(conversationResponse, text.conversationError);
      const jobResponse = await fetch(
        `/api/conversations/${conversation.id}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt,
            providerId: connectedParameters.providerId,
            modelId: connectedParameters.modelId,
            requestParams: {
              size: connectedParameters.size,
              quality: connectedParameters.quality,
              count: connectedParameters.count,
              responseFormat: connectedParameters.responseFormat
            }
          })
        }
      );
      const { job } = await parseJsonResponse<JobResponse>(
        jobResponse,
        text.queueError
      );

      updateJobMessage(assistantMessageId, job, prompt);
      await pollJob(job.id, assistantMessageId, prompt);
    } catch (error) {
      updateJobMessage(
        assistantMessageId,
        {
          id: assistantMessageId,
          status: "FAILED",
          error: error instanceof Error ? error.message : text.generationError
        },
        prompt
      );
    }
  }

  return (
    <div className="create-workbench">
      <CreateToolbar
        providers={providers}
        models={models}
        value={connectedParameters}
        onModelChange={handleModelChange}
        onSizeChange={(size) =>
          setConnectedParameters((current) => ({ ...current, size }))
        }
      />
      <div className="generation-workspace">
        <GenerationChat
          activeConfigLabel={activeConfigLabel}
          formId={generationPromptFormId}
          initialPrompt={initialPrompt}
          initialPreviewAsset={initialPreviewAsset}
          disabledReason={disabledReason}
          messages={messages}
          onSubmit={handleSubmit}
        />
        <ParameterPanel
          className="parameter-panel"
          formId={generationPromptFormId}
          submitDisabled={Boolean(disabledReason)}
          connected={connectedParameters}
          prototype={prototypeParameters}
          onConnectedChange={setConnectedParameters}
          onPrototypeChange={setPrototypeParameters}
          onReset={handleReset}
        />
      </div>
    </div>
  );
}
