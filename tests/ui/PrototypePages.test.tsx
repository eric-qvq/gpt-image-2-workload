// @vitest-environment jsdom

import { fireEvent, render, screen, within } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import React, { type ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  ShellStateProvider,
  useShellState
} from "../../src/components/layout/ShellState";
import { ApiKeysPreview } from "../../src/components/prototype/ApiKeysPreview";
import { BatchJobsPreview } from "../../src/components/prototype/BatchJobsPreview";
import { DatasetPreview } from "../../src/components/prototype/DatasetPreview";
import { SettingsPreview } from "../../src/components/prototype/SettingsPreview";
import { UsagePreview } from "../../src/components/prototype/UsagePreview";

function renderPreview(children: ReactNode) {
  return render(
    <ShellStateProvider initialModelName="OpenAI Proxy / gpt-image-2">
      {children}
    </ShellStateProvider>
  );
}

function ChineseLanguageButton() {
  const { setLanguage } = useShellState();

  return (
    <button type="button" onClick={() => setLanguage("zh")}>
      Switch to Chinese
    </button>
  );
}

describe("prototype pages", () => {
  afterEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it("keeps Batch Jobs interactive, empty, and network-free", () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");

    renderPreview(<BatchJobsPreview />);

    expect(
      screen.getByText("Interface preview · Data not connected")
    ).toBeInTheDocument();
    const tablist = screen.getByRole("tablist", { name: "Batch job status" });
    for (const tabName of ["All", "Queued", "Running", "Completed", "Failed"]) {
      expect(within(tablist).getByRole("tab", { name: tabName }))
        .toBeInTheDocument();
    }
    expect(within(tablist).getByRole("tab", { name: "All" }))
      .toHaveAttribute("aria-selected", "true");
    fireEvent.click(within(tablist).getByRole("tab", { name: "Running" }));
    expect(within(tablist).getByRole("tab", { name: "Running" }))
      .toHaveAttribute("aria-selected", "true");
    expect(within(tablist).getByRole("tab", { name: "All" }))
      .toHaveAttribute("aria-selected", "false");

    const table = screen.getByRole("table", { name: "Batch Jobs" });
    for (const heading of [
      "Job ID",
      "Input",
      "Model",
      "Progress",
      "Status",
      "Created",
      "Actions"
    ]) {
      expect(within(table).getByRole("columnheader", { name: heading }))
        .toBeInTheDocument();
    }
    expect(within(table).getByText("No batch jobs · Data not connected"))
      .toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "New Batch Job" }));
    const dialog = screen.getByRole("dialog", { name: "New Batch Job" });
    const file = new File(["{}"], "batch.jsonl", {
      type: "application/json"
    });
    fireEvent.change(within(dialog).getByLabelText("File"), {
      target: { files: [file] }
    });
    expect(within(dialog).getByText("batch.jsonl")).toBeInTheDocument();
    expect(within(dialog).getByLabelText("Model")).toHaveValue("current");
    expect(within(dialog).getByLabelText("Output settings"))
      .toHaveValue("archive");
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Create batch" })
    );

    expect(screen.getByRole("status")).toHaveTextContent(
      "Interface preview · Batch job was not saved"
    );
    expect(screen.queryByText("batch.jsonl")).not.toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("keeps Dataset tabs and import form local without adding rows", () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");

    renderPreview(<DatasetPreview />);

    const tablist = screen.getByRole("tablist", { name: "Dataset view" });
    expect(within(tablist).getByRole("tab", { name: "Dataset" }))
      .toHaveAttribute("aria-selected", "true");
    fireEvent.click(within(tablist).getByRole("tab", { name: "Files" }));
    expect(within(tablist).getByRole("tab", { name: "Files" }))
      .toHaveAttribute("aria-selected", "true");
    expect(screen.getAllByText("—")).toHaveLength(3);

    fireEvent.click(screen.getByRole("button", { name: "Import Dataset" }));
    const dialog = screen.getByRole("dialog", { name: "Import Dataset" });
    const file = new File(["prompt"], "dataset.csv", { type: "text/csv" });
    fireEvent.change(within(dialog).getByLabelText("Dataset name"), {
      target: { value: "Product prompts" }
    });
    fireEvent.change(within(dialog).getByLabelText("Dataset file"), {
      target: { files: [file] }
    });
    expect(within(dialog).getByText("dataset.csv")).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Import preview" })
    );

    expect(screen.getByRole("status")).toHaveTextContent(
      "Interface preview · Dataset was not saved"
    );
    expect(screen.queryByText("Product prompts")).not.toBeInTheDocument();
    expect(screen.queryByText("dataset.csv")).not.toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("keeps API Keys empty and never fabricates a secret", () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");

    renderPreview(<ApiKeysPreview />);

    const table = screen.getByRole("table", { name: "API keys" });
    expect(within(table).getByText("No API keys · Data not connected"))
      .toBeInTheDocument();
    expect(document.body).not.toHaveTextContent(/sk-[a-z0-9]+/i);
    expect(document.body).not.toHaveTextContent(/••••|\*\*\*\*/);

    fireEvent.click(screen.getByRole("button", { name: "Create API Key" }));
    const dialog = screen.getByRole("dialog", { name: "Create API Key" });
    fireEvent.change(within(dialog).getByLabelText("Name"), {
      target: { value: "Local automation" }
    });
    fireEvent.change(within(dialog).getByLabelText("Scope"), {
      target: { value: "models" }
    });
    fireEvent.change(within(dialog).getByLabelText("Expiration"), {
      target: { value: "never" }
    });
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Create preview key" })
    );

    expect(screen.getByRole("status")).toHaveTextContent(
      "Interface preview · API key was not saved"
    );
    expect(screen.queryByText("Local automation")).not.toBeInTheDocument();
    expect(document.body).not.toHaveTextContent(/sk-[a-z0-9]+/i);
    expect(document.body).not.toHaveTextContent(/••••|\*\*\*\*/);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("shows only disconnected usage values while period controls stay local", () => {
    renderPreview(<UsagePreview />);

    const periods = screen.getByRole("tablist", { name: "Usage period" });
    expect(within(periods).getByRole("tab", { name: "7 days" }))
      .toHaveAttribute("aria-selected", "true");
    fireEvent.click(within(periods).getByRole("tab", { name: "30 days" }));
    expect(within(periods).getByRole("tab", { name: "30 days" }))
      .toHaveAttribute("aria-selected", "true");

    const summaries = document.querySelector(".usage-summary-grid");
    expect(summaries).toBeInTheDocument();
    for (const label of ["Images Generated", "Compute Time", "Estimated Cost"]) {
      expect(within(summaries as HTMLElement).getByText(label).nextSibling)
        .toHaveTextContent("—");
    }
    expect(within(summaries as HTMLElement).getByText("Billing Status").nextSibling)
      .toHaveTextContent("Not connected");
    expect(screen.getByText("Usage data is not connected"))
      .toBeInTheDocument();
    expect(document.body).not.toHaveTextContent(/\$\s*\d|€\s*\d|¥\s*\d/);
    expect(document.body).not.toHaveTextContent(/\b(?:Free|Pro|Enterprise)\b/);
    expect(document.body).not.toHaveTextContent(/\d+\s*\/\s*\d+/);
    expect(document.body).not.toHaveTextContent(/\d+%/);
  });

  it("keeps Settings edits local while showing the real account profile", () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");

    renderPreview(
      <SettingsPreview
        account="member"
        email="member@example.com"
        role="MEMBER"
      />
    );

    expect(screen.getByRole("heading", { name: "Profile" }))
      .toBeInTheDocument();
    expect(screen.getByLabelText("Account")).toHaveValue("member");
    expect(screen.getByLabelText("Email")).toHaveValue("member@example.com");
    expect(screen.getByLabelText("Role")).toHaveValue("MEMBER");
    expect(screen.getByLabelText("Region")).toHaveValue("Local");

    fireEvent.change(screen.getByLabelText("Appearance"), {
      target: { value: "dark" }
    });
    expect(screen.getByLabelText("Appearance")).toHaveValue("dark");
    fireEvent.change(screen.getByLabelText("Default quality"), {
      target: { value: "high" }
    });
    expect(screen.getByLabelText("Default quality")).toHaveValue("high");
    fireEvent.change(screen.getByLabelText("Notifications"), {
      target: { value: "disabled" }
    });
    expect(screen.getByLabelText("Notifications")).toHaveValue("disabled");
    fireEvent.change(screen.getByLabelText("Language"), {
      target: { value: "zh" }
    });
    expect(screen.getByLabelText("语言")).toHaveValue("zh");
    fireEvent.click(
      screen.getByRole("button", { name: "保存预览设置" })
    );

    expect(screen.getByRole("status")).toHaveTextContent(
      "界面预览 · 设置未保存"
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("switches API Keys, Usage, and Settings interface copy to Chinese", () => {
    const { unmount } = renderPreview(
      <>
        <ChineseLanguageButton />
        <ApiKeysPreview />
      </>
    );

    fireEvent.click(screen.getByRole("button", { name: "Switch to Chinese" }));
    expect(screen.getByRole("heading", { name: "API 密钥" }))
      .toBeInTheDocument();
    expect(screen.getByRole("button", { name: "创建 API 密钥" }))
      .toBeInTheDocument();
    expect(screen.getByText("暂无 API 密钥 · 数据未连接"))
      .toBeInTheDocument();

    unmount();
    renderPreview(<UsagePreview />);
    expect(screen.getByRole("heading", { name: "用量与账单" }))
      .toBeInTheDocument();
    expect(screen.getByText("生成图片数")).toBeInTheDocument();
    expect(screen.getByText("用量数据尚未连接"))
      .toBeInTheDocument();
  });
});
