"use client";

import React from "react";

import { useLocalizedCopy } from "../i18n/localization";

export type ProviderListItem = {
  id: string;
  name: string;
  type: string;
  baseUrl: string;
  enabled: boolean;
};

export function ProviderList({ providers }: { providers: ProviderListItem[] }) {
  const text = useLocalizedCopy({
    en: {
      title: "Configured providers",
      table: "Configured providers",
      columns: ["Name", "Type", "Base URL", "Status"],
      types: {
        OPENAI_OFFICIAL: "OpenAI official",
        OPENAI_COMPATIBLE: "OpenAI compatible",
        CUSTOM_HTTP: "Custom HTTP"
      } as Record<string, string>,
      enabled: "Enabled",
      disabled: "Disabled",
      empty: "No providers configured."
    },
    zh: {
      title: "已配置服务商",
      table: "已配置服务商",
      columns: ["名称", "类型", "基础 URL", "状态"],
      types: {
        OPENAI_OFFICIAL: "OpenAI 官方",
        OPENAI_COMPATIBLE: "OpenAI 兼容",
        CUSTOM_HTTP: "自定义 HTTP"
      } as Record<string, string>,
      enabled: "已启用",
      disabled: "已停用",
      empty: "尚未配置服务商。"
    }
  });

  return (
    <section className="page-card provider-list-card">
      <h2>{text.title}</h2>
      <div className="table-wrap">
        <table aria-label={text.table}>
          <thead>
            <tr>
              {text.columns.map((column) => (
                <th key={column}>{column}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {providers.length ? (
              providers.map((provider) => (
                <tr key={provider.id}>
                  <td data-label={text.columns[0]}>{provider.name}</td>
                  <td data-label={text.columns[1]}>
                    {text.types[provider.type] ?? provider.type}
                  </td>
                  <td data-label={text.columns[2]}>{provider.baseUrl}</td>
                  <td data-label={text.columns[3]}>
                    {provider.enabled ? text.enabled : text.disabled}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4}>{text.empty}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
