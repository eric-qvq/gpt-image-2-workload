"use client";

import React from "react";
import { FormEvent, useState } from "react";

type ProviderOption = {
  id: string;
  name: string;
};

type ProviderModelFormProps = {
  providers: ProviderOption[];
};

export function ProviderModelForm({ providers }: ProviderModelFormProps) {
  const [status, setStatus] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const providerId = String(formData.get("providerId") ?? "");
    const name = String(formData.get("model") ?? "").trim();

    if (!providerId || !name) {
      setStatus("Provider and model name are required.");
      return;
    }

    setStatus("Saving model...");

    try {
      const response = await fetch(`/api/admin/providers/${providerId}/models`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          defaultParams: {},
          capabilities: {},
          enabled: true
        })
      });

      if (!response.ok) {
        throw new Error("Could not save model.");
      }

      form.reset();
      setStatus("Model saved.");
      window.location.reload();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unexpected error.");
    }
  }

  if (!providers.length) {
    return <p role="status">Save a provider before adding models.</p>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Add model</h2>
      <label>
        Provider
        <select name="providerId" defaultValue={providers[0]?.id ?? ""}>
          {providers.map((provider) => (
            <option key={provider.id} value={provider.id}>
              {provider.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Model name
        <input name="model" placeholder="gpt-image-2" />
      </label>
      <button type="submit">Add model</button>
      {status ? <p role="status">{status}</p> : null}
    </form>
  );
}
