"use client";

import React from "react";
import { FormEvent, useMemo, useState } from "react";

type ProviderOption = {
  id: string;
  name: string;
  type: "OPENAI_OFFICIAL" | "OPENAI_COMPATIBLE" | "CUSTOM_HTTP";
  baseUrl: string;
  enabled: boolean;
};

type ProviderEditFormProps = {
  providers: ProviderOption[];
};

export function ProviderEditForm({ providers }: ProviderEditFormProps) {
  const [providerId, setProviderId] = useState(providers[0]?.id ?? "");
  const [status, setStatus] = useState<string | null>(null);
  const selectedProvider = useMemo(
    () => providers.find((provider) => provider.id === providerId) ?? providers[0],
    [providerId, providers]
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedProvider) {
      setStatus("Save a provider before editing settings.");
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);
    const apiKey = String(formData.get("apiKey") ?? "").trim();
    const body: {
      name: string;
      type: string;
      baseUrl: string;
      enabled: boolean;
      apiKey?: string;
    } = {
      name: String(formData.get("name") ?? ""),
      type: String(formData.get("type") ?? "OPENAI_COMPATIBLE"),
      baseUrl: String(formData.get("baseUrl") ?? ""),
      enabled: formData.get("enabled") === "on"
    };

    if (apiKey) {
      body.apiKey = apiKey;
    }

    setStatus("Updating provider...");

    try {
      const response = await fetch(`/api/admin/providers/${selectedProvider.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error("Could not update provider.");
      }

      setStatus("Provider updated.");
      window.location.reload();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unexpected error.");
    }
  }

  if (!providers.length || !selectedProvider) {
    return <p role="status">Save a provider before editing settings.</p>;
  }

  return (
    <form key={selectedProvider.id} onSubmit={handleSubmit}>
      <h2>Edit provider</h2>
      <label>
        Provider
        <select
          value={providerId}
          onChange={(event) => setProviderId(event.target.value)}
        >
          {providers.map((provider) => (
            <option key={provider.id} value={provider.id}>
              {provider.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Provider name
        <input name="name" defaultValue={selectedProvider.name} />
      </label>
      <label>
        Type
        <select name="type" defaultValue={selectedProvider.type}>
          <option value="OPENAI_OFFICIAL">OpenAI official</option>
          <option value="OPENAI_COMPATIBLE">OpenAI compatible</option>
          <option value="CUSTOM_HTTP">Custom HTTP</option>
        </select>
      </label>
      <label>
        Base URL
        <input name="baseUrl" defaultValue={selectedProvider.baseUrl} />
      </label>
      <label>
        API key
        <input
          name="apiKey"
          type="password"
          placeholder="Leave blank to keep current key"
        />
      </label>
      <label>
        <input
          aria-label="Enabled"
          name="enabled"
          type="checkbox"
          defaultChecked={selectedProvider.enabled}
        />
        Enabled
      </label>
      <button type="submit">Update provider</button>
      {status ? <p role="status">{status}</p> : null}
    </form>
  );
}
