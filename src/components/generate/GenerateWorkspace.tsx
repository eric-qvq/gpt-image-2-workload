"use client";

import React from "react";
import { useMemo, useState } from "react";

import {
  GenerationChat,
  type ChatMessage
} from "../chat/GenerationChat";
import {
  ParameterPanel,
  type ParameterPanelValue
} from "../settings/ParameterPanel";

type ProviderOption = {
  id: string;
  name: string;
};

type ModelOption = {
  id: string;
  providerId: string;
  name: string;
  defaultParams: unknown;
  capabilities: unknown;
};

type GenerateWorkspaceProps = {
  providers: ProviderOption[];
  models: ModelOption[];
  initialPrompt?: string;
  initialParameters?: Partial<ParameterPanelValue>;
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

function buildJobMessage(job: JobResponse["job"]): string {
  if (job.error) {
    return job.error;
  }

  if (job.status === "ARCHIVED") {
    return "Image ready.";
  }

  if (job.status === "SUCCEEDED") {
    return "Provider completed; archiving images.";
  }

  return `Job ${job.id} is ${job.status.toLowerCase()}.`;
}

function resolveInitialParameters(
  providers: ProviderOption[],
  models: ModelOption[],
  initial: Partial<ParameterPanelValue>
): ParameterPanelValue {
  const initialModel = models.find((model) => model.id === initial.modelId);
  const providerId = providers.some((provider) => provider.id === initial.providerId)
    ? initial.providerId ?? ""
    : initialModel?.providerId ?? providers[0]?.id ?? "";
  const modelId = models.some(
    (model) => model.id === initial.modelId && model.providerId === providerId
  )
    ? initial.modelId ?? ""
    : models.find((model) => model.providerId === providerId)?.id ?? "";

  return {
    providerId,
    modelId,
    size: initial.size ?? "1024x1024",
    count: initial.count ?? 1,
    quality: initial.quality ?? "standard"
  };
}

async function parseJsonResponse<T>(response: Response, fallback: string): Promise<T> {
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
  initialParameters = {},
  pollIntervalMs = 2000,
  maxPollAttempts = 60
}: GenerateWorkspaceProps) {
  const [parameters, setParameters] = useState<ParameterPanelValue>(() =>
    resolveInitialParameters(providers, models, initialParameters)
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const availableModels = useMemo(
    () => models.filter((model) => model.providerId === parameters.providerId),
    [models, parameters.providerId]
  );
  const disabledReason =
    !parameters.providerId || !parameters.modelId
      ? "Add an enabled provider and model before generating."
      : undefined;

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
              content: buildJobMessage(job),
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
        "Could not load generation status."
      );

      updateJobMessage(messageId, body.job, prompt);

      if (terminalStatuses.has(body.job.status)) {
        return;
      }
    }
  }

  function updateParameters(next: ParameterPanelValue) {
    const providerChanged = next.providerId !== parameters.providerId;
    const nextModels = models.filter((model) => model.providerId === next.providerId);
    const modelId =
      providerChanged && !nextModels.some((model) => model.id === next.modelId)
        ? nextModels[0]?.id ?? ""
        : next.modelId;

    setParameters({ ...next, modelId });
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
        content: "Submitting generation job...",
        status: "queued"
      }
    ]);

    if (!parameters.providerId || !parameters.modelId) {
      updateJobMessage(
        assistantMessageId,
        {
          id: assistantMessageId,
          status: "FAILED",
          error: "Configure an enabled provider and model before generating."
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
      }>(conversationResponse, "Could not create conversation.");
      const jobResponse = await fetch(
        `/api/conversations/${conversation.id}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt,
            providerId: parameters.providerId,
            modelId: parameters.modelId,
            requestParams: {
              size: parameters.size,
              quality: parameters.quality,
              count: parameters.count
            }
          })
        }
      );
      const { job } = await parseJsonResponse<JobResponse>(
        jobResponse,
        "Could not queue generation job."
      );

      updateJobMessage(assistantMessageId, job, prompt);
      await pollJob(job.id, assistantMessageId, prompt);
    } catch (error) {
      updateJobMessage(
        assistantMessageId,
        {
          id: assistantMessageId,
          status: "FAILED",
          error: error instanceof Error ? error.message : "Generation failed."
        },
        prompt
      );
    }
  }

  return (
    <div>
      <GenerationChat
        initialPrompt={initialPrompt}
        disabledReason={disabledReason}
        messages={messages}
        onSubmit={handleSubmit}
      />
      <ParameterPanel
        value={parameters}
        providers={providers}
        models={availableModels}
        onChange={updateParameters}
      />
    </div>
  );
}
