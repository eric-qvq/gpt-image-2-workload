// @vitest-environment jsdom

import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AppShell } from "../../src/components/layout/AppShell";

const navigation = vi.hoisted(() => ({ pathname: "/" }));

vi.mock("next/navigation", () => ({
  usePathname: () => navigation.pathname
}));

describe("AppShell", () => {
  beforeEach(() => {
    navigation.pathname = "/";
    window.localStorage.clear();
    document.documentElement.lang = "en";
    delete document.documentElement.dataset.language;
  });

  function renderShell(role: "ADMIN" | "MEMBER" = "ADMIN") {
    return render(
      <AppShell
        role={role}
        accountLabel={role === "ADMIN" ? "admin" : "member"}
        accountEmail={`${role === "ADMIN" ? "admin" : "member"}@example.com`}
        initialModelName="Proxy / gpt-image-2"
      >
        Dashboard
      </AppShell>
    );
  }

  it("renders the complete reference navigation and truthful shell facts", () => {
    renderShell();

    const nav = within(
      screen.getByRole("navigation", { name: "Primary navigation" })
    );

    const expectedLinks = [
      ["Overview", "/"],
      ["Create", "/generate"],
      ["History", "/history"],
      ["Batch Jobs", "/batch-jobs"],
      ["Dataset", "/dataset"],
      ["Models", "/models"],
      ["API Keys", "/api-keys"],
      ["Usage & Billing", "/usage"],
      ["Settings", "/settings"]
    ] as const;

    for (const [name, href] of expectedLinks) {
      expect(nav.getByRole("link", { name })).toHaveAttribute("href", href);
    }

    expect(nav.getAllByRole("link")).toHaveLength(9);
    expect(screen.getByText("Proxy / gpt-image-2")).toBeInTheDocument();
    expect(screen.getByText("Local")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Quota" })).toHaveTextContent(
      "Not connected"
    );
    expect(screen.getByRole("button", { name: "Docs" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Notifications" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Account: admin" })
    ).toBeInTheDocument();
    expect(screen.queryByText("72%")).not.toBeInTheDocument();
  });

  it("shows the complete navigation to members", () => {
    renderShell("MEMBER");

    const nav = within(
      screen.getByRole("navigation", { name: "Primary navigation" })
    );

    expect(nav.getAllByRole("link")).toHaveLength(9);
    expect(nav.getByRole("link", { name: "Models" })).toHaveAttribute(
      "href",
      "/models"
    );
  });

  it("marks a nested route active without treating the root as a prefix", () => {
    navigation.pathname = "/history/job_123";

    renderShell();

    expect(screen.getByRole("link", { name: "History" })).toHaveAttribute(
      "aria-current",
      "page"
    );
    expect(screen.getByRole("link", { name: "Overview" })).not.toHaveAttribute(
      "aria-current"
    );
    expect(screen.getByRole("link", { name: "Create" })).not.toHaveAttribute(
      "aria-current"
    );
  });

  it("persists the selected language and restores it after the shell remounts", async () => {
    const firstRender = renderShell();

    fireEvent.change(screen.getByLabelText("Language"), {
      target: { value: "zh" }
    });

    const nav = within(
      screen.getByRole("navigation", { name: "主导航" })
    );
    expect(nav.getByRole("link", { name: "概览" })).toBeInTheDocument();
    expect(nav.getByRole("link", { name: "批量任务" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "文档" })).toBeInTheDocument();
    expect(window.localStorage.getItem("gpt-image-language")).toBe("zh");
    expect(document.documentElement).toHaveAttribute("lang", "zh-CN");
    expect(document.documentElement).toHaveAttribute("data-language", "zh");

    firstRender.unmount();
    renderShell();

    await waitFor(() =>
      expect(screen.getByLabelText("Language")).toHaveValue("zh")
    );
    expect(
      screen.getByRole("link", { name: "概览" })
    ).toBeInTheDocument();
    expect(document.documentElement).toHaveAttribute("lang", "zh-CN");

    fireEvent.change(screen.getByLabelText("Language"), {
      target: { value: "en" }
    });

    expect(window.localStorage.getItem("gpt-image-language")).toBe("en");
    expect(
      screen.getByRole("navigation", { name: "Primary navigation" })
    ).toBeInTheDocument();
    expect(document.documentElement).toHaveAttribute("lang", "en");
  });

  it("ignores an invalid saved language", async () => {
    window.localStorage.setItem("gpt-image-language", "fr");

    renderShell();

    await waitFor(() =>
      expect(screen.getByLabelText("Language")).toHaveValue("en")
    );
    expect(document.documentElement).toHaveAttribute("lang", "en");
  });

  it("opens truthful utility panels without invented values", () => {
    renderShell();

    fireEvent.click(screen.getByRole("button", { name: "Docs" }));
    expect(screen.getByRole("dialog", { name: "Docs" })).toHaveTextContent(
      "Models → Create → History"
    );

    fireEvent.click(screen.getByRole("button", { name: "Notifications" }));
    expect(
      screen.getByRole("dialog", { name: "Notifications" })
    ).toHaveTextContent("No notifications");

    fireEvent.click(screen.getByRole("button", { name: "Account: admin" }));
    const account = screen.getByRole("dialog", { name: "Account" });
    expect(account).toHaveTextContent("admin@example.com");
    expect(account).toHaveTextContent("ADMIN");
    expect(within(account).getByRole("button", { name: "Logout" })).toBeInTheDocument();
    expect(screen.queryByText(/credits?|remaining/i)).not.toBeInTheDocument();
  });

  it("closes the mobile drawer with Escape and restores focus", async () => {
    renderShell();
    const menuButton = screen.getByRole("button", { name: "Open navigation" });

    menuButton.focus();
    fireEvent.click(menuButton);
    expect(
      screen.getByRole("dialog", { name: "Mobile navigation" })
    ).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });

    await waitFor(() =>
      expect(
        screen.queryByRole("dialog", { name: "Mobile navigation" })
      ).not.toBeInTheDocument()
    );
    expect(menuButton).toHaveFocus();
  });

});
