"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

import {
  GenerationChat,
  type ChatMessage
} from "../../components/chat/GenerationChat";
import {
  ParameterPanel,
  type ParameterPanelValue
} from "../../components/settings/ParameterPanel";

const providers = [{ id: "provider_1", name: "OpenAI compatible" }];
const models = [{ id: "model_1", name: "gpt-image-2" }];

export default function GeneratePage() {
  return (
    <Suspense fallback={<main>Loading generator...</main>}>
      <GeneratePageContent />
    </Suspense>
  );
}

function readCount(value: string | null): number {
  const count = Number(value ?? 1);

  return Number.isFinite(count) && count > 0 ? count : 1;
}

function GeneratePageContent() {
  const searchParams = useSearchParams();
  const [parameters, setParameters] = useState<ParameterPanelValue>({
    providerId: searchParams.get("providerId") ?? "provider_1",
    modelId: searchParams.get("modelId") ?? "model_1",
    size: searchParams.get("size") ?? "1024x1024",
    count: readCount(searchParams.get("count")),
    quality: searchParams.get("quality") ?? "standard"
  });
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  function handleSubmit(prompt: string) {
    setMessages((currentMessages) => [
      ...currentMessages,
      { id: `user-${Date.now()}`, role: "user", content: prompt },
      {
        id: `job-${Date.now()}`,
        role: "assistant",
        content: `Queued with ${parameters.size}, ${parameters.count} image(s).`,
        status: "queued"
      }
    ]);
  }

  return (
    <main>
      <h1>Generate Images</h1>
      <div>
        <GenerationChat
          initialPrompt={searchParams.get("prompt") ?? ""}
          messages={messages}
          onSubmit={handleSubmit}
        />
        <ParameterPanel
          value={parameters}
          providers={providers}
          models={models}
          onChange={setParameters}
        />
      </div>
    </main>
  );
}
