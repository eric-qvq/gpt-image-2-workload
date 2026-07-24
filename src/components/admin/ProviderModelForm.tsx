"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { useLocalizedCopy } from "../i18n/localization";

type ProviderOption = {
  id: string;
  name: string;
};

type ProviderModelFormProps = {
  providers: ProviderOption[];
};

export function ProviderModelForm({ providers }: ProviderModelFormProps) {
  const router = useRouter();
  const [status, setStatus] = useState<string | null>(null);
  const text = useLocalizedCopy({
    en: {
      required: "Provider and model name are required.",
      saving: "Saving model...",
      saveError: "Could not save model.",
      saved: "Model saved.",
      unexpected: "Unexpected error.",
      title: "Add model",
      provider: "Provider",
      modelName: "Model name",
      add: "Add model",
      providerFirst: "Save a provider before adding models."
    },
    zh: {
      required: "必须填写服务商和模型名称。",
      saving: "正在保存模型...",
      saveError: "无法保存模型。",
      saved: "模型已保存。",
      unexpected: "发生意外错误。",
      title: "添加模型",
      provider: "服务商",
      modelName: "模型名称",
      add: "添加模型",
      providerFirst: "请先保存服务商，再添加模型。"
    }
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const providerId = String(formData.get("providerId") ?? "");
    const name = String(formData.get("model") ?? "").trim();

    if (!providerId || !name) {
      setStatus(text.required);
      return;
    }

    setStatus(text.saving);

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
        throw new Error(text.saveError);
      }

      form.reset();
      setStatus(text.saved);
      router.refresh();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : text.unexpected);
    }
  }

  if (!providers.length) {
    return (
      <section className="admin-form page-card admin-empty-state">
        <h2>{text.title}</h2>
        <p role="status">{text.providerFirst}</p>
      </section>
    );
  }

  return (
    <form className="admin-form page-card" onSubmit={handleSubmit}>
      <h2>{text.title}</h2>
      <label>
        {text.provider}
        <select name="providerId" defaultValue={providers[0]?.id ?? ""}>
          {providers.map((provider) => (
            <option key={provider.id} value={provider.id}>
              {provider.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        {text.modelName}
        <input name="model" placeholder="gpt-image-2" />
      </label>
      <button type="submit">{text.add}</button>
      {status ? <p role="status">{status}</p> : null}
    </form>
  );
}
