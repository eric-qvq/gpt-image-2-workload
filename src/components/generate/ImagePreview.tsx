"use client";

import React, { useRef, useState } from "react";

import type { ChatMessage } from "../chat/GenerationChat";
import { useLocalizedCopy } from "../i18n/localization";
import {
  PrototypeDialog,
  PrototypeStatus,
  usePrototypeFeedback
} from "../prototype/PrototypeScaffold";

export type PreviewAsset = {
  id: string;
  src: string;
  prompt: string;
  model?: string;
  createdAt?: string;
};

type ImagePreviewProps = {
  latestMessage?: ChatMessage;
  initialAsset?: PreviewAsset;
};

export function ImagePreview({
  latestMessage,
  initialAsset
}: ImagePreviewProps) {
  const [upscaleOpen, setUpscaleOpen] = useState(false);
  const [variationOpen, setVariationOpen] = useState(false);
  const [scale, setScale] = useState("2");
  const [variationCount, setVariationCount] = useState(1);
  const [menuOpen, setMenuOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const upscaleTriggerRef = useRef<HTMLButtonElement>(null);
  const variationTriggerRef = useRef<HTMLButtonElement>(null);
  const { message, showPreviewFeedback } = usePrototypeFeedback();
  const text = useLocalizedCopy({
    en: {
      panel: "Image preview",
      eyebrow: "Preview",
      title: "Image preview",
      statuses: {
        queued: "queued",
        running: "running",
        succeeded: "succeeded",
        failed: "failed"
      },
      ready: "Ready when inspiration hits.",
      empty: "Your generated image will appear here.",
      download: "Download",
      history: "History",
      upscale: "Upscale",
      variations: "Variations",
      more: "More image actions",
      details: "View details",
      copyPrompt: "Copy prompt",
      prompt: "Prompt",
      model: "Model",
      created: "Created",
      upscaleTitle: "Upscale image",
      cancel: "Cancel",
      confirmUpscale: "Confirm upscale",
      upscaleNotice: "Interface preview · No upscale job will be created.",
      scale: "Scale",
      variationsTitle: "Create variations",
      confirmVariations: "Confirm variations",
      variationsNotice: "Interface preview · No variation job will be created.",
      variationCount: "Variation count"
    },
    zh: {
      panel: "图像预览",
      eyebrow: "预览",
      title: "图像预览",
      statuses: {
        queued: "排队中",
        running: "运行中",
        succeeded: "已完成",
        failed: "失败"
      },
      ready: "灵感一来，就可以开始。",
      empty: "生成的图像会显示在这里。",
      download: "下载",
      history: "历史记录",
      upscale: "放大",
      variations: "变体",
      more: "更多图像操作",
      details: "查看详情",
      copyPrompt: "复制提示词",
      prompt: "提示词",
      model: "模型",
      created: "创建时间",
      upscaleTitle: "放大图像",
      cancel: "取消",
      confirmUpscale: "确认放大",
      upscaleNotice: "界面预览 · 不会创建放大任务。",
      scale: "放大倍数",
      variationsTitle: "创建变体",
      confirmVariations: "确认变体",
      variationsNotice: "界面预览 · 不会创建变体任务。",
      variationCount: "变体数量"
    }
  });
  const firstMessageImage = latestMessage?.images?.[0];
  const activeAsset = latestMessage
    ? firstMessageImage
      ? {
          id: firstMessageImage.id,
          src: firstMessageImage.src,
          prompt: firstMessageImage.alt
        }
      : undefined
    : initialAsset;
  const copyablePrompt = latestMessage
    ? firstMessageImage?.alt
    : initialAsset?.prompt;
  const detailModel = latestMessage ? undefined : initialAsset?.model;
  const detailCreatedAt = latestMessage ? undefined : initialAsset?.createdAt;

  return (
    <>
      <section className="preview-panel" aria-label={text.panel}>
        <header className="panel-header">
          <div>
            <p className="eyebrow">{text.eyebrow}</p>
            <h2>{text.title}</h2>
          </div>
          {latestMessage?.status ? (
            <span className={`status-pill ${latestMessage.status}`}>
              {text.statuses[latestMessage.status]}
            </span>
          ) : null}
        </header>

        <div
          className="preview-stage"
          aria-live="polite"
          aria-busy={
            latestMessage?.status === "queued" ||
            latestMessage?.status === "running"
              ? true
              : undefined
          }
        >
          {latestMessage ? (
            <article className="preview-result">
              <p>{latestMessage.content}</p>
              {latestMessage.images?.length ? (
                <div className="image-strip">
                  {latestMessage.images.map((image) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={image.id} src={image.src} alt={image.alt} />
                  ))}
                </div>
              ) : null}
            </article>
          ) : initialAsset ? (
            <article className="preview-result initial-preview-result">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={initialAsset.src} alt={initialAsset.prompt} />
              <p>{initialAsset.prompt}</p>
            </article>
          ) : (
            <div className="empty-state">
              <div className="empty-orb" aria-hidden="true" />
              <h3>{text.ready}</h3>
              <p className="muted">{text.empty}</p>
            </div>
          )}
        </div>

        {activeAsset ? (
          <div className="preview-actions">
            <a href={activeAsset.src} download>
              {text.download}
            </a>
            <a href="/history">{text.history}</a>
            <button
              ref={upscaleTriggerRef}
              type="button"
              onClick={() => setUpscaleOpen(true)}
            >
              {text.upscale}
            </button>
            <button
              ref={variationTriggerRef}
              type="button"
              onClick={() => setVariationOpen(true)}
            >
              {text.variations}
            </button>
            {copyablePrompt || detailModel || detailCreatedAt ? (
              <div className="preview-overflow">
                <button
                  type="button"
                  aria-label={text.more}
                  aria-expanded={menuOpen}
                  onClick={() => setMenuOpen((open) => !open)}
                >
                  ⋯
                </button>
                {menuOpen ? (
                  <div className="preview-overflow__menu">
                    <button
                      type="button"
                      onClick={() => {
                        setDetailsOpen(true);
                        setMenuOpen(false);
                      }}
                    >
                      {text.details}
                    </button>
                    {copyablePrompt ? (
                      <button
                        type="button"
                        onClick={() => {
                          void navigator.clipboard?.writeText(copyablePrompt);
                          setMenuOpen(false);
                        }}
                      >
                        {text.copyPrompt}
                      </button>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}

        {detailsOpen && activeAsset ? (
          <dl className="preview-details">
            <div>
              <dt>{text.prompt}</dt>
              <dd>{activeAsset.prompt}</dd>
            </div>
            {detailModel ? (
              <div>
                <dt>{text.model}</dt>
                <dd>{detailModel}</dd>
              </div>
            ) : null}
            {detailCreatedAt ? (
              <div>
                <dt>{text.created}</dt>
                <dd>{detailCreatedAt}</dd>
              </div>
            ) : null}
          </dl>
        ) : null}
        <PrototypeStatus message={message} />
      </section>

      <PrototypeDialog
        open={upscaleOpen}
        title={text.upscaleTitle}
        onClose={() => setUpscaleOpen(false)}
        returnFocusRef={upscaleTriggerRef}
        actions={
          <>
            <button type="button" onClick={() => setUpscaleOpen(false)}>
              {text.cancel}
            </button>
            <button
              type="button"
              onClick={() => {
                showPreviewFeedback({ en: "Upscale", zh: "放大操作" });
                setUpscaleOpen(false);
              }}
            >
              {text.confirmUpscale}
            </button>
          </>
        }
      >
        <p className="prototype-notice">
          {text.upscaleNotice}
        </p>
        <label>
          {text.scale}
          <select value={scale} onChange={(event) => setScale(event.target.value)}>
            <option value="2">2×</option>
            <option value="4">4×</option>
          </select>
        </label>
      </PrototypeDialog>

      <PrototypeDialog
        open={variationOpen}
        title={text.variationsTitle}
        onClose={() => setVariationOpen(false)}
        returnFocusRef={variationTriggerRef}
        actions={
          <>
            <button type="button" onClick={() => setVariationOpen(false)}>
              {text.cancel}
            </button>
            <button
              type="button"
              onClick={() => {
                showPreviewFeedback({ en: "Variations", zh: "变体操作" });
                setVariationOpen(false);
              }}
            >
              {text.confirmVariations}
            </button>
          </>
        }
      >
        <p className="prototype-notice">
          {text.variationsNotice}
        </p>
        <label>
          {text.variationCount}
          <input
            type="number"
            min={1}
            max={4}
            value={variationCount}
            onChange={(event) => setVariationCount(Number(event.target.value))}
          />
        </label>
      </PrototypeDialog>
    </>
  );
}
