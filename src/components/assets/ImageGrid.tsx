"use client";

import { useEffect, useState } from "react";

import { useLocalizedCopy } from "../i18n/localization";

type ImageGridAsset = {
  id: string;
  src: string;
  prompt: string;
  providerId: string;
  modelId: string;
  model: string;
  createdAt: string;
  requestParams: Record<string, string | number | boolean>;
};

type ImageGridProps = {
  assets: ImageGridAsset[];
};

export function ImageGrid({ assets }: ImageGridProps) {
  const [previewAsset, setPreviewAsset] = useState<ImageGridAsset | null>(null);
  const text = useLocalizedCopy({
    en: {
      history: "Image history",
      previewGenerated: (model: string) => `Preview image generated with ${model}`,
      download: "Download",
      reuse: "Reuse",
      empty: "No generated images yet.",
      previewDialog: "Image preview",
      preview: "Preview",
      closePreview: "Close image preview",
      downloadImage: "Download image",
      reusePrompt: "Reuse prompt"
    },
    zh: {
      history: "图片历史记录",
      previewGenerated: (model: string) => `预览由 ${model} 生成的图片`,
      download: "下载",
      reuse: "复用",
      empty: "暂无生成图片。",
      previewDialog: "图片预览",
      preview: "预览",
      closePreview: "关闭图片预览",
      downloadImage: "下载图片",
      reusePrompt: "复用提示词"
    }
  });

  useEffect(() => {
    if (!previewAsset) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setPreviewAsset(null);
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [previewAsset]);

  function reuseHref(asset: ImageGridAsset): string {
    const params = new URLSearchParams({
      prompt: asset.prompt,
      providerId: asset.providerId,
      modelId: asset.modelId,
      model: asset.model
    });

    for (const [key, value] of Object.entries(asset.requestParams)) {
      params.set(key, String(value));
    }

    params.set("prompt", asset.prompt);
    params.set("providerId", asset.providerId);
    params.set("modelId", asset.modelId);
    params.set("model", asset.model);

    return `/generate?${params.toString()}`;
  }

  function closePreview() {
    setPreviewAsset(null);
  }

  return (
    <>
      <section className="asset-grid" aria-label={text.history}>
        {assets.length ? (
          assets.map((asset) => (
            <article className="asset-card" key={asset.id}>
              <button
                className="image-preview-button"
                type="button"
                onClick={() => setPreviewAsset(asset)}
                aria-label={text.previewGenerated(asset.model)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={asset.src} alt={asset.prompt} />
              </button>
              <h3>{asset.model}</h3>
              <p>{asset.prompt}</p>
              <div className="asset-meta">
                {Object.entries(asset.requestParams).slice(0, 3).map(([key, value]) => (
                  <span key={key}>{key}: {String(value)}</span>
                ))}
              </div>
              <time className="muted" dateTime={asset.createdAt}>
                {asset.createdAt}
              </time>
              <div className="button-row">
                <a className="button" href={asset.src} download>
                  {text.download}
                </a>
                <a className="button" href={reuseHref(asset)}>
                  {text.reuse}
                </a>
              </div>
            </article>
          ))
        ) : (
          <p className="muted">{text.empty}</p>
        )}
      </section>

      {previewAsset ? (
        <div
          className="image-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={text.previewDialog}
          onClick={closePreview}
        >
          <div className="image-lightbox-card" onClick={(event) => event.stopPropagation()}>
            <div className="lightbox-image-wrap">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewAsset.src} alt={previewAsset.prompt} />
            </div>
            <aside className="lightbox-details">
              <div className="panel-header compact">
                <div>
                  <p className="eyebrow">{text.preview}</p>
                  <h2>{previewAsset.model}</h2>
                </div>
                <button
                  className="icon-button"
                  type="button"
                  aria-label={text.closePreview}
                  onClick={closePreview}
                >
                  ×
                </button>
              </div>
              <p>{previewAsset.prompt}</p>
              <div className="asset-meta">
                {Object.entries(previewAsset.requestParams).map(([key, value]) => (
                  <span key={key}>{key}: {String(value)}</span>
                ))}
              </div>
              <time className="muted" dateTime={previewAsset.createdAt}>
                {previewAsset.createdAt}
              </time>
              <div className="button-row">
                <a className="button primary-button" href={previewAsset.src} download>
                  {text.downloadImage}
                </a>
                <a className="button ghost-button" href={reuseHref(previewAsset)}>
                  {text.reusePrompt}
                </a>
              </div>
            </aside>
          </div>
        </div>
      ) : null}
    </>
  );
}
