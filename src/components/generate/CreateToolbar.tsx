"use client";

import React, { useMemo, useRef, useState } from "react";

import { useLocalizedCopy } from "../i18n/localization";
import { PrototypeDialog } from "../prototype/PrototypeScaffold";
import type {
  ConnectedGenerationParameters,
  ModelOption,
  ProviderOption
} from "./types";

type CreateToolbarProps = {
  providers: ProviderOption[];
  models: ModelOption[];
  value: ConnectedGenerationParameters;
  onModelChange: (modelId: string) => void;
  onSizeChange: (size: string) => void;
};

const sizeOptions = [
  { value: "1024x1024", label: "1024 × 1024 (1:1)" },
  { value: "1536x1024", label: "1536 × 1024 (3:2)" },
  { value: "1024x1536", label: "1024 × 1536 (2:3)" }
] as const;

export function CreateToolbar({
  providers,
  models,
  value,
  onModelChange,
  onSizeChange
}: CreateToolbarProps) {
  const [codeOpen, setCodeOpen] = useState(false);
  const codeTriggerRef = useRef<HTMLButtonElement>(null);
  const text = useLocalizedCopy({
    en: {
      configuration: "Create configuration",
      model: "Model",
      noModels: "No models available",
      provider: "Provider",
      resolution: "Resolution",
      viewCode: "View Code",
      requestExample: "Request example",
      promptExample: "Describe the image you want to create."
    },
    zh: {
      configuration: "创建配置",
      model: "模型",
      noModels: "暂无可用模型",
      provider: "服务商",
      resolution: "分辨率",
      viewCode: "查看代码",
      requestExample: "请求示例",
      promptExample: "描述你想创建的图像。"
    }
  });
  const providerNames = useMemo(
    () => new Map(providers.map((provider) => [provider.id, provider.name])),
    [providers]
  );
  const requestExample = JSON.stringify(
    {
      prompt: text.promptExample,
      providerId: value.providerId,
      modelId: value.modelId,
      requestParams: {
        size: value.size,
        quality: value.quality,
        count: value.count,
        responseFormat: value.responseFormat
      }
    },
    null,
    2
  );

  return (
    <section className="create-toolbar" aria-label={text.configuration}>
      <label>
        {text.model}
        <select
          value={value.modelId}
          onChange={(event) => onModelChange(event.target.value)}
          disabled={!models.length}
        >
          {!models.length ? <option value="">{text.noModels}</option> : null}
          {models.map((model) => (
            <option key={model.id} value={model.id}>
              {providerNames.get(model.providerId) ?? text.provider} / {model.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        {text.resolution}
        <select
          value={value.size}
          onChange={(event) => onSizeChange(event.target.value)}
        >
          {sizeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <button
        ref={codeTriggerRef}
        type="button"
        className="secondary-action"
        onClick={() => setCodeOpen(true)}
      >
        {text.viewCode}
      </button>
      <PrototypeDialog
        open={codeOpen}
        title={text.requestExample}
        onClose={() => setCodeOpen(false)}
        returnFocusRef={codeTriggerRef}
      >
        <p>
          <code>POST /api/conversations/{"{id}"}/messages</code>
        </p>
        <pre>{requestExample}</pre>
      </PrototypeDialog>
    </section>
  );
}
