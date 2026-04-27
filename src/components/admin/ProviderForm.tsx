"use client";

import { FormEvent, useState } from "react";

export function ProviderForm() {
  const [status, setStatus] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const modelName = String(formData.get("model") ?? "").trim();

    setStatus("Saving provider...");

    try {
      const providerResponse = await fetch("/api/admin/providers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(formData.get("name") ?? ""),
          type: String(formData.get("type") ?? "OPENAI_COMPATIBLE"),
          baseUrl: String(formData.get("baseUrl") ?? ""),
          apiKey: String(formData.get("apiKey") ?? ""),
          enabled: formData.get("enabled") === "on"
        })
      });

      if (!providerResponse.ok) {
        throw new Error("Could not save provider.");
      }

      const { provider } = (await providerResponse.json()) as {
        provider: { id: string };
      };

      if (modelName) {
        const modelResponse = await fetch(
          `/api/admin/providers/${provider.id}/models`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: modelName,
              defaultParams: {},
              capabilities: {},
              enabled: true
            })
          }
        );

        if (!modelResponse.ok) {
          throw new Error("Provider saved, but the default model failed.");
        }
      }

      form.reset();
      setStatus("Provider saved.");
      window.location.reload();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unexpected error.");
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Provider name
        <input name="name" placeholder="OpenAI proxy" />
      </label>
      <label>
        Type
        <select name="type" defaultValue="OPENAI_COMPATIBLE">
          <option value="OPENAI_OFFICIAL">OpenAI official</option>
          <option value="OPENAI_COMPATIBLE">OpenAI compatible</option>
          <option value="CUSTOM_HTTP">Custom HTTP</option>
        </select>
      </label>
      <label>
        Base URL
        <input name="baseUrl" placeholder="https://api.example.com/v1" />
      </label>
      <label>
        API key
        <input name="apiKey" type="password" />
      </label>
      <label>
        Default model
        <input name="model" placeholder="gpt-image-2" />
      </label>
      <label>
        <input name="enabled" type="checkbox" defaultChecked />
        Enabled
      </label>
      <button type="submit">Save provider</button>
      {status ? <p role="status">{status}</p> : null}
    </form>
  );
}
