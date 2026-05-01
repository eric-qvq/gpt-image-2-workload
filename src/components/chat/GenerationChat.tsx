"use client";

import React from "react";
import { FormEvent, useState } from "react";

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
  initialPrompt?: string;
  disabledReason?: string;
  onSubmit: (prompt: string) => void | Promise<void>;
};

export function GenerationChat({
  messages,
  initialPrompt = "",
  disabledReason,
  onSubmit
}: GenerationChatProps) {
  const [prompt, setPrompt] = useState(initialPrompt);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedPrompt = prompt.trim();

    if (disabledReason) return;
    if (!trimmedPrompt) return;

    void onSubmit(trimmedPrompt);
    setPrompt("");
  }

  return (
    <section aria-label="Generation chat">
      <div>
        {messages.map((message) => (
          <article key={message.id}>
            <header>
              <strong>{message.role}</strong>
              {message.status ? <span>{message.status}</span> : null}
            </header>
            <p>{message.content}</p>
            {message.images?.length ? (
              <div>
                {message.images.map((image) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={image.id} src={image.src} alt={image.alt} />
                ))}
              </div>
            ) : null}
          </article>
        ))}
      </div>
      <form onSubmit={handleSubmit}>
        <label>
          Prompt
          <textarea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            rows={4}
          />
        </label>
        {disabledReason ? <p role="alert">{disabledReason}</p> : null}
        <button type="submit" disabled={Boolean(disabledReason)}>
          Generate
        </button>
      </form>
    </section>
  );
}
