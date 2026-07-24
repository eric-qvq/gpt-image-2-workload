"use client";

import React from "react";

import { useLocalizedCopy } from "../i18n/localization";

type CatalogModel = {
  id: string;
  providerId: string;
  providerName: string;
  name: string;
};

export function ModelCatalog({
  models,
  currentModelId
}: {
  models: CatalogModel[];
  currentModelId?: string;
}) {
  const text = useLocalizedCopy({
    en: {
      title: "Available models",
      current: "Current",
      empty: "No enabled models are connected."
    },
    zh: {
      title: "可用模型",
      current: "当前使用",
      empty: "尚未连接已启用的模型。"
    }
  });

  return (
    <section
      className="page-card model-catalog"
      aria-labelledby="model-catalog-title"
    >
      <div className="panel-header compact">
        <h2 id="model-catalog-title">{text.title}</h2>
        <span>{models.length || "—"}</span>
      </div>
      {models.length ? (
        <ul className="model-catalog__list">
          {models.map((model) => (
            <li key={model.id}>
              <strong>
                {model.providerName} / {model.name}
              </strong>
              {model.id === currentModelId ? <span>{text.current}</span> : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className="muted">{text.empty}</p>
      )}
    </section>
  );
}
