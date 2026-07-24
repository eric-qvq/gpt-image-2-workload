"use client";

import React from "react";

import { useLocalizedCopy } from "../i18n/localization";

export function TodaysUsage() {
  const text = useLocalizedCopy({
    en: {
      title: "Today's Usage",
      notConnected: "Not connected",
      images: "Images Generated",
      compute: "Compute Time",
      details: "View Usage Details"
    },
    zh: {
      title: "今日用量",
      notConnected: "未连接",
      images: "生成图片数",
      compute: "计算时间",
      details: "查看用量明细"
    }
  });

  return (
    <section className="todays-usage" aria-labelledby="todays-usage-title">
      <div className="panel-header compact">
        <h2 id="todays-usage-title">{text.title}</h2>
        <span className="muted">{text.notConnected}</span>
      </div>
      <dl>
        <div>
          <dt>{text.images}</dt>
          <dd>—</dd>
        </div>
        <div>
          <dt>{text.compute}</dt>
          <dd>—</dd>
        </div>
      </dl>
      <a href="/usage">{text.details}</a>
    </section>
  );
}
