"use client";

import Link from "next/link";
import React from "react";

import { useLocalizedCopy } from "../i18n/localization";

const copy = {
  en: {
    eyebrow: "Overview",
    title: "Image generation workspace",
    description:
      "Create image jobs, let the worker process the queue, and return to archived results when they are ready.",
    capabilitiesLabel: "Platform capabilities",
    actionsLabel: "Overview actions",
    stats: [
      ["Queue", "Generation jobs run through the worker."],
      ["Archive", "Completed images remain available in history."],
      ["Reuse", "Previous prompts can seed another generation."]
    ],
    entries: [
      ["/generate", "Create", "+", "Start a prompt and queue a new image generation job."],
      ["/history", "History", "▣", "Review archived outputs and reuse a previous prompt."],
      ["/models", "Models", "⚙", "Review available models and manage providers when authorized."]
    ]
  },
  zh: {
    eyebrow: "概览",
    title: "图像生成工作区",
    description: "创建图像任务，由工作进程处理队列，并在完成后返回归档结果。",
    capabilitiesLabel: "平台能力",
    actionsLabel: "概览操作",
    stats: [
      ["队列", "生成任务通过工作进程执行。"],
      ["归档", "已完成的图片会保留在历史记录中。"],
      ["复用", "可以使用历史提示词发起新的生成任务。"]
    ],
    entries: [
      ["/generate", "创建", "+", "输入提示词并提交新的图像生成任务。"],
      ["/history", "历史记录", "▣", "查看归档结果并复用以前的提示词。"],
      ["/models", "模型", "⚙", "查看可用模型，并在有权限时管理服务商。"]
    ]
  }
};

export function OverviewContent() {
  const text = useLocalizedCopy(copy);

  return (
    <section
      className="page-card overview-card"
      aria-labelledby="overview-title"
    >
      <div className="panel-header">
        <div>
          <p className="eyebrow">{text.eyebrow}</p>
          <h1 id="overview-title">{text.title}</h1>
          <p className="muted">{text.description}</p>
        </div>
      </div>

      <dl className="hero-stats" aria-label={text.capabilitiesLabel}>
        {text.stats.map(([label, description]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{description}</dd>
          </div>
        ))}
      </dl>

      <nav aria-label={text.actionsLabel}>
        <ul className="nav-grid">
          {text.entries.map(([href, label, icon, description]) => (
            <li key={href}>
              <Link className="card-link" href={href}>
                <span className="card-icon" aria-hidden="true">
                  {icon}
                </span>
                <strong>{label}</strong>
                <span>{description}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </section>
  );
}
