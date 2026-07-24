"use client";

import React, { type FormEvent, useRef, useState } from "react";

import { useShellState } from "../layout/ShellState";
import {
  PrototypeDialog,
  PrototypePageFrame,
  PrototypeStatus,
  usePrototypeFeedback
} from "./PrototypeScaffold";

type DatasetTab = "datasets" | "files";

const copy = {
  en: {
    title: "Dataset",
    description: "Organize reusable prompt data once dataset storage is connected.",
    importDataset: "Import Dataset",
    tabLabel: "Dataset view",
    datasetsTab: "Dataset",
    filesTab: "Files",
    summaries: ["Datasets", "Files", "Storage"],
    datasetColumns: ["Name", "Files", "Storage", "Updated"],
    fileColumns: ["File", "Dataset", "Size", "Updated"],
    emptyDatasets: "No datasets · Data not connected",
    emptyFiles: "No files · Data not connected",
    name: "Dataset name",
    file: "Dataset file",
    cancel: "Cancel",
    importPreview: "Import preview"
  },
  zh: {
    title: "数据集",
    description: "在数据集存储接通后组织可复用的提示词数据。",
    importDataset: "导入数据集",
    tabLabel: "数据集视图",
    datasetsTab: "数据集",
    filesTab: "文件",
    summaries: ["数据集", "文件", "存储"],
    datasetColumns: ["名称", "文件", "存储", "更新时间"],
    fileColumns: ["文件", "数据集", "大小", "更新时间"],
    emptyDatasets: "暂无数据集 · 数据未连接",
    emptyFiles: "暂无文件 · 数据未连接",
    name: "数据集名称",
    file: "数据集文件",
    cancel: "取消",
    importPreview: "导入预览"
  }
} as const;

export function DatasetPreview() {
  const { language } = useShellState();
  const text = copy[language];
  const [activeTab, setActiveTab] = useState<DatasetTab>("datasets");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [datasetName, setDatasetName] = useState("");
  const [selectedFileName, setSelectedFileName] = useState("");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const { message, showPreviewFeedback } = usePrototypeFeedback();
  const columns =
    activeTab === "datasets" ? text.datasetColumns : text.fileColumns;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setDialogOpen(false);
    setDatasetName("");
    setSelectedFileName("");
    showPreviewFeedback({ en: "Dataset", zh: "数据集" });
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
          {text.importDataset}
        </button>
      }
    >
      <PrototypeStatus message={message} />
      <div className="prototype-summary-grid">
        {text.summaries.map((summary) => (
          <section className="page-card prototype-summary-card" key={summary}>
            <span>{summary}</span>
            <strong>—</strong>
          </section>
        ))}
      </div>
      <section className="page-card prototype-surface">
        <div role="tablist" aria-label={text.tabLabel}>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "datasets"}
            onClick={() => setActiveTab("datasets")}
          >
            {text.datasetsTab}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "files"}
            onClick={() => setActiveTab("files")}
          >
            {text.filesTab}
          </button>
        </div>
        <div className="table-wrap">
          <table className="prototype-table" aria-label={text.title}>
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column}>{column}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={4}>
                  {activeTab === "datasets"
                    ? text.emptyDatasets
                    : text.emptyFiles}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <PrototypeDialog
        open={dialogOpen}
        title={text.importDataset}
        onClose={() => setDialogOpen(false)}
        returnFocusRef={triggerRef}
        actions={
          <>
            <button type="button" onClick={() => setDialogOpen(false)}>
              {text.cancel}
            </button>
            <button type="submit" form="import-dataset-form">
              {text.importPreview}
            </button>
          </>
        }
      >
        <form id="import-dataset-form" onSubmit={handleSubmit}>
          <label>
            {text.name}
            <input
              value={datasetName}
              onChange={(event) => setDatasetName(event.target.value)}
            />
          </label>
          <label>
            {text.file}
            <input
              type="file"
              accept=".csv,.jsonl,text/csv,application/json"
              onChange={(event) =>
                setSelectedFileName(event.target.files?.[0]?.name ?? "")
              }
            />
          </label>
          {selectedFileName ? <p>{selectedFileName}</p> : null}
        </form>
      </PrototypeDialog>
    </PrototypePageFrame>
  );
}
