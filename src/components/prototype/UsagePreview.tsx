"use client";

import React, { useState } from "react";

import { useLocalizedCopy } from "../i18n/localization";
import { PrototypePageFrame } from "./PrototypeScaffold";

type UsagePeriod = "7" | "30" | "90";

const periodValues: UsagePeriod[] = ["7", "30", "90"];

export function UsagePreview() {
  const [period, setPeriod] = useState<UsagePeriod>("7");
  const text = useLocalizedCopy({
    en: {
      title: "Usage & Billing",
      description: "Review the usage layout while metering and billing remain disconnected.",
      periodLabel: "Usage period",
      periodSuffix: "days",
      images: "Images Generated",
      compute: "Compute Time",
      cost: "Estimated Cost",
      billing: "Billing Status",
      notConnected: "Not connected",
      trend: "Usage trend",
      trendEmpty: "Usage data is not connected",
      details: "Usage details",
      columns: ["Date", "Model", "Images", "Compute Time", "Estimated Cost"],
      empty: "No usage records · Data not connected"
    },
    zh: {
      title: "用量与账单",
      description: "计量和账单尚未接通，可在此预览用量页面布局。",
      periodLabel: "用量周期",
      periodSuffix: "天",
      images: "生成图片数",
      compute: "计算时间",
      cost: "预估费用",
      billing: "账单状态",
      notConnected: "未连接",
      trend: "用量趋势",
      trendEmpty: "用量数据尚未连接",
      details: "用量明细",
      columns: ["日期", "模型", "图片数", "计算时间", "预估费用"],
      empty: "暂无用量记录 · 数据未连接"
    }
  });

  return (
    <PrototypePageFrame
      title={text.title}
      description={text.description}
      actions={
        <div role="tablist" aria-label={text.periodLabel}>
          {periodValues.map((value) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={period === value}
              onClick={() => setPeriod(value)}
            >
              {value} {text.periodSuffix}
            </button>
          ))}
        </div>
      }
    >
      <div className="prototype-summary-grid usage-summary-grid">
        <dl className="page-card prototype-summary-card">
          <dt>{text.images}</dt>
          <dd>—</dd>
        </dl>
        <dl className="page-card prototype-summary-card">
          <dt>{text.compute}</dt>
          <dd>—</dd>
        </dl>
        <dl className="page-card prototype-summary-card">
          <dt>{text.cost}</dt>
          <dd>—</dd>
        </dl>
        <dl className="page-card prototype-summary-card">
          <dt>{text.billing}</dt>
          <dd>{text.notConnected}</dd>
        </dl>
      </div>
      <section className="page-card usage-chart" aria-labelledby="usage-chart-title">
        <div className="panel-header compact">
          <h2 id="usage-chart-title">{text.trend}</h2>
          <span className="muted">{text.notConnected}</span>
        </div>
        <div className="usage-chart__empty">{text.trendEmpty}</div>
      </section>
      <section className="page-card prototype-surface">
        <h2>{text.details}</h2>
        <div className="table-wrap">
          <table className="prototype-table" aria-label={text.details}>
            <thead>
              <tr>
                {text.columns.map((column) => (
                  <th key={column}>{column}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={5}>{text.empty}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </PrototypePageFrame>
  );
}
