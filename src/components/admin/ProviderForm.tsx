"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { useLocalizedCopy } from "../i18n/localization";

function readError(body: unknown, fallback: string): string {
  return typeof body === "object" &&
    body !== null &&
    "error" in body &&
    typeof body.error === "string"
    ? body.error
    : fallback;
}

export function ProviderForm() {
  const router = useRouter();
  const [status, setStatus] = useState<string | null>(null);
  const text = useLocalizedCopy({
    en: {
      saving: "Saving provider...",
      saveError: "Could not save provider.",
      modelError: "Provider saved, but the default model failed.",
      saved: "Provider saved.",
      unexpected: "Unexpected error.",
      title: "Add provider",
      name: "Provider name",
      namePlaceholder: "OpenAI proxy",
      type: "Type",
      official: "OpenAI official",
      compatible: "OpenAI compatible",
      custom: "Custom HTTP",
      baseUrl: "Base URL",
      apiKey: "API key",
      defaultModel: "Default model",
      enabled: "Enabled",
      save: "Save provider"
    },
    zh: {
      saving: "正在保存服务商...",
      saveError: "无法保存服务商。",
      modelError: "服务商已保存，但默认模型保存失败。",
      saved: "服务商已保存。",
      unexpected: "发生意外错误。",
      title: "添加服务商",
      name: "服务商名称",
      namePlaceholder: "OpenAI 代理",
      type: "类型",
      official: "OpenAI 官方",
      compatible: "OpenAI 兼容",
      custom: "自定义 HTTP",
      baseUrl: "基础 URL",
      apiKey: "API 密钥",
      defaultModel: "默认模型",
      enabled: "启用",
      save: "保存服务商"
    }
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const modelName = String(formData.get("model") ?? "").trim();

    setStatus(text.saving);

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
        const body = await providerResponse.json().catch(() => ({}));

        throw new Error(readError(body, text.saveError));
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
          throw new Error(text.modelError);
        }
      }

      form.reset();
      setStatus(text.saved);
      router.refresh();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : text.unexpected);
    }
  }

  return (
    <form className="admin-form page-card" onSubmit={handleSubmit}>
      <h2>{text.title}</h2>
      <label>
        {text.name}
        <input name="name" placeholder={text.namePlaceholder} required />
      </label>
      <label>
        {text.type}
        <select name="type" defaultValue="OPENAI_COMPATIBLE">
          <option value="OPENAI_OFFICIAL">{text.official}</option>
          <option value="OPENAI_COMPATIBLE">{text.compatible}</option>
          <option value="CUSTOM_HTTP">{text.custom}</option>
        </select>
      </label>
      <label>
        {text.baseUrl}
        <input
          name="baseUrl"
          placeholder="https://api.example.com/v1"
          required
          type="url"
        />
      </label>
      <label>
        {text.apiKey}
        <input name="apiKey" required type="password" />
      </label>
      <label>
        {text.defaultModel}
        <input name="model" placeholder="gpt-image-2" />
      </label>
      <label>
        <input name="enabled" type="checkbox" defaultChecked />
        {text.enabled}
      </label>
      <button type="submit">{text.save}</button>
      {status ? <p role="status">{status}</p> : null}
    </form>
  );
}
