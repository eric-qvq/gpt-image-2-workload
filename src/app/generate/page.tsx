"use client";

import { useState } from "react";

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
  const [parameters, setParameters] = useState<ParameterPanelValue>({
    providerId: "provider_1",
    modelId: "model_1",
    size: "1024x1024",
    count: 1,
    quality: "standard"
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
        <GenerationChat messages={messages} onSubmit={handleSubmit} />
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
