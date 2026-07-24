"use client";

import React from "react";

import {
  ImagePreview,
  type PreviewAsset
} from "../generate/ImagePreview";
import { PromptComposer } from "../generate/PromptComposer";

type ChatImage = {
  id: string;
  src: string;
  alt: string;
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  status?: "queued" | "running" | "succeeded" | "failed";
  images?: ChatImage[];
};

type GenerationChatProps = {
  messages: ChatMessage[];
  activeConfigLabel?: string;
  formId: string;
  initialPrompt?: string;
  initialPreviewAsset?: PreviewAsset;
  disabledReason?: string;
  onSubmit: (prompt: string) => void | Promise<void>;
};

export function GenerationChat({
  messages,
  activeConfigLabel,
  formId,
  initialPrompt = "",
  initialPreviewAsset,
  disabledReason,
  onSubmit
}: GenerationChatProps) {
  const latestAssistantMessage = [...messages]
    .reverse()
    .find((message) => message.role === "assistant");

  return (
    <div className="generation-editor">
      <PromptComposer
        activeConfigLabel={activeConfigLabel}
        formId={formId}
        initialPrompt={initialPrompt}
        disabledReason={disabledReason}
        onSubmit={onSubmit}
      />

      <ImagePreview
        latestMessage={latestAssistantMessage}
        initialAsset={initialPreviewAsset}
      />
    </div>
  );
}
