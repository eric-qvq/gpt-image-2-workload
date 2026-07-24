"use client";

import React, { type FormEvent, useRef, useState } from "react";

import { useShellState } from "../layout/ShellState";
import {
  PrototypeDialog,
  PrototypePageFrame,
  PrototypeStatus,
  usePrototypeFeedback
} from "./PrototypeScaffold";

type BatchStatus = "all" | "queued" | "running" | "completed" | "failed";

const copy = {
  en: {
    title: "Batch Jobs",
    description: "Review batch-generation controls before job storage is connected.",
    newBatch: "New Batch Job",
    search: "Search batch jobs",
    statusLabel: "Batch job status",
    statuses: {
      all: "All",
      queued: "Queued",
      running: "Running",
      completed: "Completed",
      failed: "Failed"
    },
    columns: ["Job ID", "Input", "Model", "Progress", "Status", "Created", "Actions"],
    empty: "No batch jobs · Data not connected",
    file: "File",
    model: "Model",
    output: "Output settings",
    currentModel: "Current model",
    archive: "Archive images",
    providerUrls: "Provider URLs",
    cancel: "Cancel",
    create: "Create batch"
  },
  zh: {
    title: "批量任务",
    description: "在任务存储接通前预览批量生成界面。",
    newBatch: "新建批量任务",
    search: "搜索批量任务",
    statusLabel: "批量任务状态",
    statuses: {
      all: "全部",
      queued: "排队中",
      running: "运行中",
      completed: "已完成",
      failed: "失败"
    },
    columns: ["任务 ID", "输入", "模型", "进度", "状态", "创建时间", "操作"],
    empty: "暂无批量任务 · 数据未连接",
    file: "文件",
    model: "模型",
    output: "输出设置",
    currentModel: "当前模型",
    archive: "归档图片",
    providerUrls: "服务商 URL",
    cancel: "取消",
    create: "创建预览"
  }
} as const;

const statusOrder: BatchStatus[] = [
  "all",
  "queued",
  "running",
  "completed",
  "failed"
];

export function BatchJobsPreview() {
  const { language, currentModelName } = useShellState();
  const text = copy[language];
  const [activeStatus, setActiveStatus] = useState<BatchStatus>("all");
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [model, setModel] = useState("current");
  const [output, setOutput] = useState("archive");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const { message, showPreviewFeedback } = usePrototypeFeedback();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setDialogOpen(false);
    setSelectedFileName("");
    showPreviewFeedback({ en: "Batch job", zh: "批量任务" });
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
          {text.newBatch}
        </button>
      }
    >
      <PrototypeStatus message={message} />
      <section className="page-card prototype-surface">
        <div className="prototype-filters">
          <div role="tablist" aria-label={text.statusLabel}>
            {statusOrder.map((status) => (
              <button
                key={status}
                type="button"
                role="tab"
                aria-selected={activeStatus === status}
                onClick={() => setActiveStatus(status)}
              >
                {text.statuses[status]}
              </button>
            ))}
          </div>
          <label>
            <span className="sr-only">{text.search}</span>
            <input
              type="search"
              aria-label={text.search}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={text.search}
            />
          </label>
        </div>
        <div className="table-wrap">
          <table className="prototype-table" aria-label={text.title}>
            <thead>
              <tr>
                {text.columns.map((column) => (
                  <th key={column}>{column}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={7}>{text.empty}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <PrototypeDialog
        open={dialogOpen}
        title={text.newBatch}
        onClose={() => setDialogOpen(false)}
        returnFocusRef={triggerRef}
        actions={
          <>
            <button type="button" onClick={() => setDialogOpen(false)}>
              {text.cancel}
            </button>
            <button type="submit" form="new-batch-job-form">
              {text.create}
            </button>
          </>
        }
      >
        <form id="new-batch-job-form" onSubmit={handleSubmit}>
          <label>
            {text.file}
            <input
              type="file"
              accept=".jsonl,.csv,application/json,text/csv"
              onChange={(event) =>
                setSelectedFileName(event.target.files?.[0]?.name ?? "")
              }
            />
          </label>
          {selectedFileName ? <p>{selectedFileName}</p> : null}
          <label>
            {text.model}
            <select value={model} onChange={(event) => setModel(event.target.value)}>
              <option value="current">
                {text.currentModel}: {currentModelName}
              </option>
            </select>
          </label>
          <label>
            {text.output}
            <select value={output} onChange={(event) => setOutput(event.target.value)}>
              <option value="archive">{text.archive}</option>
              <option value="url">{text.providerUrls}</option>
            </select>
          </label>
        </form>
      </PrototypeDialog>
    </PrototypePageFrame>
  );
}
