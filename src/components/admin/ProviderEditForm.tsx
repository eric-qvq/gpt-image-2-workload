"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";

import { useLocalizedCopy } from "../i18n/localization";

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
  const router = useRouter();
  const [providerId, setProviderId] = useState(providers[0]?.id ?? "");
  const [status, setStatus] = useState<string | null>(null);
  const selectedProvider = useMemo(
    () => providers.find((provider) => provider.id === providerId) ?? providers[0],
    [providerId, providers]
  );
  const text = useLocalizedCopy({
    en: {
      required: "Save a provider before editing settings.",
      updating: "Updating provider...",
      updateError: "Could not update provider.",
      updated: "Provider updated.",
      unexpected: "Unexpected error.",
      title: "Edit provider",
      provider: "Provider",
      name: "Provider name",
      type: "Type",
      official: "OpenAI official",
      compatible: "OpenAI compatible",
      custom: "Custom HTTP",
      baseUrl: "Base URL",
      apiKey: "API key",
      apiKeyPlaceholder: "Leave blank to keep current key",
      enabled: "Enabled",
      update: "Update provider"
    },
    zh: {
      required: "请先保存服务商，再编辑设置。",
      updating: "正在更新服务商...",
      updateError: "无法更新服务商。",
      updated: "服务商已更新。",
      unexpected: "发生意外错误。",
      title: "编辑服务商",
      provider: "服务商",
      name: "服务商名称",
      type: "类型",
      official: "OpenAI 官方",
      compatible: "OpenAI 兼容",
      custom: "自定义 HTTP",
      baseUrl: "基础 URL",
      apiKey: "API 密钥",
      apiKeyPlaceholder: "留空以保留当前密钥",
      enabled: "启用",
      update: "更新服务商"
    }
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedProvider) {
      setStatus(text.required);
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

    setStatus(text.updating);

    try {
      const response = await fetch(`/api/admin/providers/${selectedProvider.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error(text.updateError);
      }

      setStatus(text.updated);
      router.refresh();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : text.unexpected);
    }
  }

  if (!providers.length || !selectedProvider) {
    return (
      <section className="admin-form page-card admin-empty-state">
        <h2>{text.title}</h2>
        <p role="status">{text.required}</p>
      </section>
    );
  }

  return (
    <form
      className="admin-form page-card"
      key={selectedProvider.id}
      onSubmit={handleSubmit}
    >
      <h2>{text.title}</h2>
      <label>
        {text.provider}
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
        {text.name}
        <input name="name" defaultValue={selectedProvider.name} />
      </label>
      <label>
        {text.type}
        <select name="type" defaultValue={selectedProvider.type}>
          <option value="OPENAI_OFFICIAL">{text.official}</option>
          <option value="OPENAI_COMPATIBLE">{text.compatible}</option>
          <option value="CUSTOM_HTTP">{text.custom}</option>
        </select>
      </label>
      <label>
        {text.baseUrl}
        <input name="baseUrl" defaultValue={selectedProvider.baseUrl} />
      </label>
      <label>
        {text.apiKey}
        <input
          name="apiKey"
          type="password"
          placeholder={text.apiKeyPlaceholder}
        />
      </label>
      <label>
        <input
          aria-label={text.enabled}
          name="enabled"
          type="checkbox"
          defaultChecked={selectedProvider.enabled}
        />
        {text.enabled}
      </label>
      <button type="submit">{text.update}</button>
      {status ? <p role="status">{status}</p> : null}
    </form>
  );
}
