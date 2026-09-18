"use client";

import React, { type FormEvent, useRef, useState } from "react";

import { useLocalizedCopy } from "../i18n/localization";
import {
  PrototypeDialog,
  PrototypeNotice,
  PrototypeStatus
} from "../prototype/PrototypeScaffold";

type PromptComposerProps = {
  activeConfigLabel?: string;
  formId: string;
  initialPrompt?: string;
  disabledReason?: string;
  onSubmit: (prompt: string) => void | Promise<void>;
};

export function PromptComposer({
  activeConfigLabel,
  formId,
  initialPrompt = "",
  disabledReason,
  onSubmit
}: PromptComposerProps) {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [negativePrompt, setNegativePrompt] = useState("");
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [enhanceOpen, setEnhanceOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const templatesTriggerRef = useRef<HTMLButtonElement>(null);
  const enhanceTriggerRef = useRef<HTMLButtonElement>(null);
  const promptLength = prompt.trim().length;
  const text = useLocalizedCopy({
    en: {
      panel: "Prompt panel",
      eyebrow: "Create",
      title: "Prompt",
      templates: "Templates",
      form: "Generation prompt",
      prompt: "Prompt",
      placeholder: "Describe the image you want to create.",
      enhance: "Enhance Prompt",
      negative: "Negative Prompt (optional)",
      negativePlaceholder: "Elements to avoid in the interface preview.",
      characterCount: (count: number) =>
        `${count} ${count === 1 ? "character" : "characters"}`,
      templateTitle: "Prompt templates",
      enhanceTitle: "Enhance Prompt",
      cancel: "Cancel",
      confirm: "Confirm preview",
      explanation:
        "This control is visible for interface review. It does not rewrite or send your prompt.",
      notEnhanced: "Interface preview · Prompt was not enhanced",
      templateItems: [
        {
          name: "Cinematic city",
          prompt: "A futuristic city at sunset, cinematic lighting, ultra detailed."
        },
        {
          name: "Mountain landscape",
          prompt: "A serene alpine valley, dramatic clouds, photorealistic landscape."
        },
        {
          name: "Editorial portrait",
          prompt: "An editorial studio portrait, soft key light, natural skin texture."
        }
      ]
    },
    zh: {
      panel: "提示词面板",
      eyebrow: "创建",
      title: "提示词",
      templates: "模板",
      form: "图像生成提示词",
      prompt: "提示词",
      placeholder: "描述你想创建的图像。",
      enhance: "增强提示词",
      negative: "反向提示词（可选）",
      negativePlaceholder: "输入希望在界面预览中避免的元素。",
      characterCount: (count: number) => `${count} 个字符`,
      templateTitle: "提示词模板",
      enhanceTitle: "增强提示词",
      cancel: "取消",
      confirm: "确认预览",
      explanation: "此控件仅用于界面评审，不会改写或发送你的提示词。",
      notEnhanced: "界面预览 · 提示词未增强",
      templateItems: [
        {
          name: "电影感城市",
          prompt: "夕阳下的未来城市，电影感光影，极致细节。"
        },
        {
          name: "山地风景",
          prompt: "宁静的高山峡谷，戏剧性云层，写实风景摄影。"
        },
        {
          name: "杂志人像",
          prompt: "杂志风棚拍人像，柔和主光，自然皮肤质感。"
        }
      ]
    }
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedPrompt = prompt.trim();

    if (disabledReason || !trimmedPrompt) return;

    void onSubmit(trimmedPrompt);
    setPrompt("");
  }

  return (
    <section className="prompt-panel" aria-label={text.panel}>
      <header className="panel-header">
        <div>
          <p className="eyebrow">{text.eyebrow}</p>
          <h2>{text.title}</h2>
          {activeConfigLabel ? <p className="muted">{activeConfigLabel}</p> : null}
        </div>
        <div className="prompt-tools">
          <button
            ref={templatesTriggerRef}
            type="button"
            onClick={() => setTemplatesOpen(true)}
          >
            {text.templates}
          </button>
        </div>
      </header>

      <form id={formId} aria-label={text.form} onSubmit={handleSubmit}>
        <label>
          {text.prompt}
          <textarea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder={text.placeholder}
            rows={5}
          />
        </label>
        <button
          ref={enhanceTriggerRef}
          type="button"
          className="enhance-prompt-action"
          onClick={() => setEnhanceOpen(true)}
        >
          <span aria-hidden="true">✦</span>
          <span>{text.enhance}</span>
          <span aria-hidden="true">+</span>
        </button>
        <label>
          {text.negative}
          <textarea
            value={negativePrompt}
            onChange={(event) => setNegativePrompt(event.target.value)}
            placeholder={text.negativePlaceholder}
            rows={2}
          />
        </label>
        {disabledReason ? (
          <p className="alert" role="alert">
            {disabledReason}
          </p>
        ) : null}
        <div className="prompt-footer">
          <span className="muted">{text.characterCount(promptLength)}</span>
        </div>
        <PrototypeStatus message={statusMessage} />
      </form>

      <PrototypeDialog
        open={templatesOpen}
        title={text.templateTitle}
        onClose={() => setTemplatesOpen(false)}
        returnFocusRef={templatesTriggerRef}
      >
        <div className="prompt-template-list">
          {text.templateItems.map((template) => (
            <button
              key={template.name}
              type="button"
              aria-label={template.name}
              onClick={() => {
                setPrompt(template.prompt);
                setTemplatesOpen(false);
              }}
            >
              <strong>{template.name}</strong>
              <span>{template.prompt}</span>
            </button>
          ))}
        </div>
      </PrototypeDialog>

      <PrototypeDialog
        open={enhanceOpen}
        title={text.enhanceTitle}
        onClose={() => setEnhanceOpen(false)}
        returnFocusRef={enhanceTriggerRef}
        actions={
          <>
            <button type="button" onClick={() => setEnhanceOpen(false)}>
              {text.cancel}
            </button>
            <button
              type="button"
              onClick={() => {
                setStatusMessage(text.notEnhanced);
                setEnhanceOpen(false);
              }}
            >
              {text.confirm}
            </button>
          </>
        }
      >
        <PrototypeNotice />
        <p>
          {text.explanation}
        </p>
      </PrototypeDialog>
    </section>
  );
}
