"use client";

import React from "react";

import { useLocalizedCopy } from "../i18n/localization";

type RecentGenerationAsset = {
  id: string;
  src: string;
  prompt: string;
  model: string;
  createdAt: string;
};

type RecentGenerationsProps = {
  assets: RecentGenerationAsset[];
};

const MAX_RECENT_GENERATIONS = 6;

export function RecentGenerations({ assets }: RecentGenerationsProps) {
  const visibleAssets = assets.slice(0, MAX_RECENT_GENERATIONS);
  const text = useLocalizedCopy({
    en: {
      eyebrow: "Archive",
      title: "Recent Generations",
      viewAll: "View All",
      empty: "No generated images yet."
    },
    zh: {
      eyebrow: "归档",
      title: "最近生成",
      viewAll: "查看全部",
      empty: "暂无生成图片。"
    }
  });

  return (
    <section
      className="recent-generations"
      aria-labelledby="recent-generations-title"
    >
      <div className="panel-header compact">
        <div>
          <p className="eyebrow">{text.eyebrow}</p>
          <h2 id="recent-generations-title">{text.title}</h2>
        </div>
        <a className="button ghost-button" href="/history">
          {text.viewAll}
        </a>
      </div>

      {visibleAssets.length ? (
        <div className="image-strip">
          {visibleAssets.map((asset) => (
            <article className="asset-card" key={asset.id}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={asset.src}
                alt={asset.prompt}
                loading="lazy"
                decoding="async"
              />
              <p>{asset.prompt}</p>
              <div className="asset-meta">
                <span>{asset.model}</span>
              </div>
              <time className="muted" dateTime={asset.createdAt}>
                {asset.createdAt}
              </time>
            </article>
          ))}
        </div>
      ) : (
        <p className="muted">{text.empty}</p>
      )}
    </section>
  );
}
