"use client";

import React, { type FormEvent, useRef, useState } from "react";

import { useLocalizedCopy } from "../i18n/localization";
import {
  PrototypeDialog,
  PrototypePageFrame,
  PrototypeStatus,
  usePrototypeFeedback
} from "./PrototypeScaffold";

export function ApiKeysPreview() {
  const text = useLocalizedCopy({
    en: {
      title: "API Keys",
      description: "Preview access-key controls without creating or revealing a secret.",
      create: "Create API Key",
      tableLabel: "API keys",
      columns: ["Name", "Scope", "Expiration", "Created", "Actions"],
      empty: "No API keys · Data not connected",
      cancel: "Cancel",
      createPreview: "Create preview key",
      name: "Name",
      scope: "Scope",
      expiration: "Expiration",
      generate: "Generate",
      history: "History",
      models: "Models",
      days30: "30 days",
      days90: "90 days",
      never: "No expiration",
      notice: "Interface preview · No credential will be created or displayed."
    },
    zh: {
      title: "API 密钥",
      description: "预览访问密钥控件，不会创建或显示任何真实密钥。",
      create: "创建 API 密钥",
      tableLabel: "API 密钥",
      columns: ["名称", "权限范围", "有效期", "创建时间", "操作"],
      empty: "暂无 API 密钥 · 数据未连接",
      cancel: "取消",
      createPreview: "创建预览密钥",
      name: "名称",
      scope: "权限范围",
      expiration: "有效期",
      generate: "生成",
      history: "历史记录",
      models: "模型",
      days30: "30 天",
      days90: "90 天",
      never: "永不过期",
      notice: "界面预览 · 不会创建或显示任何凭据。"
    }
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [scope, setScope] = useState("generate");
  const [expiration, setExpiration] = useState("30");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const { message, showPreviewFeedback } = usePrototypeFeedback();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setDialogOpen(false);
    setName("");
    setScope("generate");
    setExpiration("30");
    showPreviewFeedback({ en: "API key", zh: "API 密钥" });
  }

  return (
    <PrototypePageFrame
      title={text.title}
      description={text.description}
      actions={
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setDialogOpen(true)}
        >
          {text.create}
        </button>
      }
    >
      <PrototypeStatus message={message} />
      <section className="page-card prototype-surface">
        <div className="table-wrap">
          <table className="prototype-table" aria-label={text.tableLabel}>
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

      <PrototypeDialog
        open={dialogOpen}
        title={text.create}
        onClose={() => setDialogOpen(false)}
        returnFocusRef={triggerRef}
        actions={
          <>
            <button type="button" onClick={() => setDialogOpen(false)}>
              {text.cancel}
            </button>
            <button type="submit" form="create-api-key-form">
              {text.createPreview}
            </button>
          </>
        }
      >
        <form id="create-api-key-form" onSubmit={handleSubmit}>
          <label>
            {text.name}
            <input value={name} onChange={(event) => setName(event.target.value)} />
          </label>
          <label>
            {text.scope}
            <select value={scope} onChange={(event) => setScope(event.target.value)}>
              <option value="generate">{text.generate}</option>
              <option value="history">{text.history}</option>
              <option value="models">{text.models}</option>
            </select>
          </label>
          <label>
            {text.expiration}
            <select
              value={expiration}
              onChange={(event) => setExpiration(event.target.value)}
            >
              <option value="30">{text.days30}</option>
              <option value="90">{text.days90}</option>
              <option value="never">{text.never}</option>
            </select>
          </label>
          <p className="prototype-notice">
            {text.notice}
          </p>
        </form>
      </PrototypeDialog>
    </PrototypePageFrame>
  );
}
