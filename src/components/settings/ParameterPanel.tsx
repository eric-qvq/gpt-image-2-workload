"use client";

import React, { useId } from "react";

import { useLocalizedCopy } from "../i18n/localization";
import type {
  ConnectedGenerationParameters,
  PrototypeGenerationParameters
} from "../generate/types";

export type ParameterPanelValue = ConnectedGenerationParameters;

type ParameterPanelProps = {
  className?: string;
  formId: string;
  submitDisabled?: boolean;
  connected: ConnectedGenerationParameters;
  prototype: PrototypeGenerationParameters;
  onConnectedChange: (value: ConnectedGenerationParameters) => void;
  onPrototypeChange: (value: PrototypeGenerationParameters) => void;
  onReset: () => void;
};

const responseFormatValues = ["url", "b64_json"] as const;
const styleValues = ["auto", "vivid", "natural"] as const;

export function ParameterPanel({
  className,
  formId,
  submitDisabled = false,
  connected,
  prototype,
  onConnectedChange,
  onPrototypeChange,
  onReset
}: ParameterPanelProps) {
  const guidanceId = useId();
  const text = useLocalizedCopy({
    en: {
      panel: "Generation parameters",
      eyebrow: "Settings",
      title: "Parameters",
      reset: "Reset parameters",
      quality: "Quality",
      standard: "Standard",
      high: "High",
      ultra: "Ultra",
      style: "Style",
      styles: { auto: "Auto", vivid: "Vivid", natural: "Natural" },
      seed: "Seed (optional)",
      random: "Random",
      guidance: "Guidance Scale",
      guidanceLimits: "Guidance limits",
      outputFormat: "Output Format",
      safety: "Safety Filter",
      advanced: "Advanced delivery",
      advancedNote: "Interface-only controls are not sent",
      count: "Count",
      delivery: "Delivery",
      responseFormats: { url: "Provider URL", b64_json: "Base64 JSON" },
      image: "image",
      images: "images",
      sent: "Sent",
      notice:
        "Interface preview · Ultra, Style, Seed, Guidance, Output Format, and Safety Filter are not sent to the provider.",
      generate: "Generate image"
    },
    zh: {
      panel: "生成参数",
      eyebrow: "设置",
      title: "参数",
      reset: "重置参数",
      quality: "质量",
      standard: "标准",
      high: "高",
      ultra: "超高",
      style: "风格",
      styles: { auto: "自动", vivid: "鲜艳", natural: "自然" },
      seed: "种子（可选）",
      random: "随机",
      guidance: "引导强度",
      guidanceLimits: "引导强度范围",
      outputFormat: "输出格式",
      safety: "安全过滤",
      advanced: "高级交付设置",
      advancedNote: "仅界面控件不会发送",
      count: "数量",
      delivery: "交付方式",
      responseFormats: { url: "服务商 URL", b64_json: "Base64 JSON" },
      image: "张图片",
      images: "张图片",
      sent: "已发送",
      notice: "界面预览 · 超高质量、风格、种子、引导强度、输出格式和安全过滤不会发送给服务商。",
      generate: "生成图像"
    }
  });

  function updateConnected(next: Partial<ConnectedGenerationParameters>) {
    onConnectedChange({ ...connected, ...next });
  }

  function updatePrototype(next: Partial<PrototypeGenerationParameters>) {
    onPrototypeChange({ ...prototype, ...next });
  }

  function selectConnectedQuality(
    quality: ConnectedGenerationParameters["quality"]
  ) {
    updateConnected({ quality });
    updatePrototype({ previewQuality: null });
  }

  const selectedQuality = prototype.previewQuality ?? connected.quality;
  const deliveryLabel =
    text.responseFormats[connected.responseFormat];
  const countLabel = `${connected.count} ${
    connected.count === 1 ? text.image : text.images
  }`;
  const connectedQualityLabel =
    connected.quality === "high" ? text.high : text.standard;

  return (
    <aside
      className={["generation-parameters", className].filter(Boolean).join(" ")}
      aria-label={text.panel}
    >
      <div className="panel-header compact">
        <div>
          <p className="eyebrow">{text.eyebrow}</p>
          <h2>{text.title}</h2>
        </div>
        <button type="button" className="text-action" onClick={onReset}>
          {text.reset}
        </button>
      </div>

      <div className="setting-stack">
        <div className="setting-field">
          <span>{text.quality}</span>
          <div className="quality-segments" role="group" aria-label={text.quality}>
            <button
              type="button"
              aria-pressed={selectedQuality === "standard"}
              onClick={() => selectConnectedQuality("standard")}
            >
              {text.standard}
            </button>
            <button
              type="button"
              aria-pressed={selectedQuality === "high"}
              onClick={() => selectConnectedQuality("high")}
            >
              {text.high}
            </button>
            <button
              type="button"
              aria-pressed={selectedQuality === "ultra"}
              onClick={() => updatePrototype({ previewQuality: "ultra" })}
            >
              {text.ultra}
            </button>
          </div>
        </div>

        <div className="setting-field">
          <span>{text.style}</span>
          <div className="style-segments" role="group" aria-label={text.style}>
            {styleValues.map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={prototype.style === value}
                onClick={() => updatePrototype({ style: value })}
              >
                {text.styles[value]}
              </button>
            ))}
          </div>
        </div>

        <label>
          {text.seed}
          <input
            type="text"
            inputMode="numeric"
            value={prototype.seed}
            onChange={(event) => updatePrototype({ seed: event.target.value })}
            placeholder={text.random}
          />
        </label>

        <div className="setting-field">
          <span className="setting-label-row">
            <label htmlFor={guidanceId}>{text.guidance}</label>
            <output htmlFor={guidanceId}>{prototype.guidance}</output>
          </span>
          <input
            id={guidanceId}
            type="range"
            min="1"
            max="20"
            step="0.5"
            value={prototype.guidance}
            onInput={(event) =>
              updatePrototype({ guidance: Number(event.currentTarget.value) })
            }
          />
          <div
            className="guidance-scale__limits"
            role="group"
            aria-label={text.guidanceLimits}
          >
            <span>1</span>
            <span>20</span>
          </div>
        </div>

        <label>
          {text.outputFormat}
          <select
            value={prototype.outputFormat}
            onChange={(event) =>
              updatePrototype({
                outputFormat:
                  event.target.value as PrototypeGenerationParameters["outputFormat"]
              })
            }
          >
            <option value="png">PNG</option>
            <option value="jpeg">JPEG</option>
            <option value="webp">WebP</option>
          </select>
        </label>

        <label className="checkbox-field safety-switch">
          <input
            className="safety-switch__input"
            type="checkbox"
            checked={prototype.safetyFilter}
            onChange={(event) =>
              updatePrototype({ safetyFilter: event.target.checked })
            }
          />
          <span className="safety-switch__track" aria-hidden="true">
            <span />
          </span>
          <span>{text.safety}</span>
        </label>

        <details className="advanced-delivery">
          <summary>
            <span>{text.advanced}</span>
            <small>{text.advancedNote}</small>
          </summary>
          <div className="setting-stack">
            <label>
              {text.count}
              <input
                min={1}
                max={8}
                type="number"
                value={connected.count}
                onChange={(event) =>
                  updateConnected({ count: Number(event.target.value) })
                }
              />
            </label>
            <label>
              {text.delivery}
              <select
                value={connected.responseFormat}
                onChange={(event) =>
                  updateConnected({
                    responseFormat: event.target
                      .value as ConnectedGenerationParameters["responseFormat"]
                  })
                }
              >
                {responseFormatValues.map((value) => (
                  <option key={value} value={value}>
                    {text.responseFormats[value]}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <p className="parameter-summary">
            {text.sent}: {connectedQualityLabel} · {deliveryLabel} · {countLabel}
          </p>
          <p className="prototype-notice">
            {text.notice}
          </p>
        </details>
      </div>
      <button
        className="generation-submit"
        type="submit"
        form={formId}
        disabled={submitDisabled}
      >
        {text.generate}
      </button>
    </aside>
  );
}
