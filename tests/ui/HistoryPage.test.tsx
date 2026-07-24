// @vitest-environment jsdom

import { fireEvent, render, screen, within } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import HistoryPage, { dynamic } from "../../src/app/history/page";

vi.stubGlobal("React", React);

const mocks = vi.hoisted(() => ({
  cookieGet: vi.fn(),
  cookies: vi.fn(),
  countHistoryAssets: vi.fn(),
  getAccountSummary: vi.fn(),
  getSessionFromToken: vi.fn(),
  listHistoryAssets: vi.fn(),
  listGenerationOptions: vi.fn(),
  redirect: vi.fn()
}));

vi.mock("next/headers", () => ({
  cookies: mocks.cookies
}));

vi.mock("next/navigation", () => ({
  redirect: mocks.redirect,
  usePathname: () => "/history"
}));

vi.mock("../../src/server/auth/request-session", () => ({
  getSessionFromToken: mocks.getSessionFromToken
}));

vi.mock("../../src/server/history/assets", () => ({
  countHistoryAssets: mocks.countHistoryAssets,
  listHistoryAssets: mocks.listHistoryAssets
}));

vi.mock("../../src/server/users/repository", () => ({
  getAccountSummary: mocks.getAccountSummary
}));

vi.mock("../../src/server/providers/repository", () => ({
  listGenerationOptions: mocks.listGenerationOptions
}));

const assets = [
  {
    id: "asset_copper",
    src: "/api/image-assets/asset_copper",
    prompt: "A copper robot in a greenhouse",
    providerId: "provider_1",
    modelId: "model_1",
    model: "gpt-image-2",
    createdAt: "2026-07-12T01:02:03.000Z",
    requestParams: { quality: "high" }
  },
  {
    id: "asset_ocean",
    src: "/api/image-assets/asset_ocean",
    prompt: "A teal ocean at dusk",
    providerId: "provider_1",
    modelId: "model_1",
    model: "gpt-image-2",
    createdAt: "2026-07-11T01:02:03.000Z",
    requestParams: { quality: "medium" }
  }
];

describe("HistoryPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
    mocks.cookieGet.mockReturnValue({ value: "session-token" });
    mocks.cookies.mockResolvedValue({ get: mocks.cookieGet });
    mocks.getSessionFromToken.mockResolvedValue({
      userId: "user_member",
      role: "MEMBER"
    });
    mocks.getAccountSummary.mockResolvedValue({
      account: "member",
      email: "member@example.com"
    });
    mocks.listGenerationOptions.mockResolvedValue({
      providers: [{ id: "provider_1", name: "Proxy" }],
      models: [
        {
          id: "model_1",
          providerId: "provider_1",
          name: "gpt-image-2",
          defaultParams: {},
          capabilities: {}
        }
      ]
    });
    mocks.listHistoryAssets.mockResolvedValue(assets);
    mocks.countHistoryAssets.mockResolvedValue(125);
    mocks.redirect.mockImplementation(() => {
      throw new Error("NEXT_REDIRECT");
    });
  });

  it("renders filtered history inside the member shell with truthful pagination", async () => {
    const { container } = render(
      await HistoryPage({
        searchParams: Promise.resolve({ query: "copper", page: "2" })
      })
    );

    const navigation = within(
      screen.getByRole("navigation", { name: "Primary navigation" })
    );
    const pageHeading = container.querySelector(".page-heading");
    const historyFilter = screen
      .getByRole("button", { name: "Apply" })
      .closest("form");
    const historyToolbar = historyFilter?.closest("section");
    const historySummary = screen.getByText(
      "Showing 1 of 125 archived images. Page 2."
    );
    const pagination = screen.getByRole("navigation", {
      name: "History pagination"
    });

    expect(dynamic).toBe("force-dynamic");
    expect(screen.getByText("GPT Image Workbench")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Account: member" })
    ).toBeInTheDocument();
    expect(screen.getByText("Proxy / gpt-image-2")).toBeInTheDocument();
    expect(navigation.getByRole("link", { name: "History" })).toHaveAttribute(
      "aria-current",
      "page"
    );
    expect(
      navigation.getByRole("link", { name: "Models" })
    ).toHaveAttribute("href", "/models");
    expect(screen.queryByRole("button", { name: "Back" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Generate" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Logout" })).not.toBeInTheDocument();
    expect(pageHeading).toBeInTheDocument();
    expect(
      within(pageHeading as HTMLElement).getByRole("heading", { name: "History" })
    ).toBeInTheDocument();
    expect(historyToolbar).toHaveClass("page-card", "history-toolbar");
    expect(historyFilter).toHaveClass("history-filter");
    expect(historySummary).toHaveClass("history-summary");
    expect(pagination).toHaveClass("history-pagination");

    expect(screen.getByLabelText("Filter current page")).toHaveValue("copper");
    expect(
      screen.getByRole("img", { name: "A copper robot in a greenhouse" })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("img", { name: "A teal ocean at dusk" })
    ).not.toBeInTheDocument();
    expect(screen.getByText("Showing 1 of 125 archived images. Page 2.")).toBeInTheDocument();
    expect(
      within(pagination).getByRole("link", { name: "Previous" })
    ).toBeInTheDocument();
    expect(
      within(pagination).getByRole("link", { name: "Next" })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Previous" })).toHaveAttribute(
      "href",
      "/history?query=copper"
    );
    expect(screen.getByRole("link", { name: "Next" })).toHaveAttribute(
      "href",
      "/history?query=copper&page=3"
    );
    expect(mocks.listHistoryAssets).toHaveBeenCalledWith(
      { userId: "user_member", role: "MEMBER" },
      { limit: 50, offset: 50 }
    );
    expect(mocks.countHistoryAssets).toHaveBeenCalledWith({
      userId: "user_member",
      role: "MEMBER"
    });
  });

  it("redirects before querying history when the member session is missing", async () => {
    mocks.cookieGet.mockReturnValue(undefined);
    mocks.getSessionFromToken.mockResolvedValue(null);

    await expect(
      Promise.resolve().then(() => HistoryPage({}))
    ).rejects.toThrow("NEXT_REDIRECT");

    expect(mocks.cookieGet).toHaveBeenCalledWith("session");
    expect(mocks.getSessionFromToken).toHaveBeenCalledWith(undefined);
    expect(mocks.redirect).toHaveBeenCalledWith("/login");
    expect(mocks.listHistoryAssets).not.toHaveBeenCalled();
    expect(mocks.countHistoryAssets).not.toHaveBeenCalled();
  });

  it("switches history controls and image actions to Chinese", async () => {
    render(await HistoryPage({}));

    fireEvent.change(screen.getByLabelText("Language"), {
      target: { value: "zh" }
    });

    expect(
      screen.getByRole("heading", { name: "历史记录", level: 1 })
    ).toBeInTheDocument();
    expect(screen.getByLabelText("筛选当前页")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "应用" })).toBeInTheDocument();
    expect(screen.getByText("显示 2 / 125 张归档图片。第 1 页。"))
      .toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "下载" })).toHaveLength(2);
    expect(screen.getAllByRole("link", { name: "复用" })).toHaveLength(2);
    expect(screen.getByText("A copper robot in a greenhouse"))
      .toBeInTheDocument();
  });

  it("normalizes a positive fractional page below one to the first page", async () => {
    mocks.listHistoryAssets.mockResolvedValue([]);
    mocks.countHistoryAssets.mockResolvedValue(0);

    render(
      await HistoryPage({
        searchParams: Promise.resolve({ page: "0.5" })
      })
    );

    expect(mocks.listHistoryAssets).toHaveBeenCalledWith(
      { userId: "user_member", role: "MEMBER" },
      { limit: 50, offset: 0 }
    );
    expect(
      screen.getByText("Showing 0 of 0 archived images. Page 1.")
    ).toBeInTheDocument();
  });

  it("uses a consistent empty fallback when listing fails but counting succeeds", async () => {
    mocks.listHistoryAssets.mockRejectedValue(new Error("list offline"));
    mocks.countHistoryAssets.mockResolvedValue(125);

    render(await HistoryPage({}));

    expect(screen.getByText("No generated images yet.")).toBeInTheDocument();
    expect(
      screen.getByText("Showing 0 of 0 archived images. Page 1.")
    ).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Next" })).not.toBeInTheDocument();
  });

  it("uses a consistent empty fallback when counting fails but listing succeeds", async () => {
    mocks.listHistoryAssets.mockResolvedValue(assets);
    mocks.countHistoryAssets.mockRejectedValue(new Error("count offline"));

    render(await HistoryPage({}));

    expect(screen.getByText("No generated images yet.")).toBeInTheDocument();
    expect(
      screen.queryByRole("img", { name: "A copper robot in a greenhouse" })
    ).not.toBeInTheDocument();
    expect(
      screen.getByText("Showing 0 of 0 archived images. Page 1.")
    ).toBeInTheDocument();
  });

  it("falls back to an empty history when repositories fail", async () => {
    mocks.listHistoryAssets.mockRejectedValue(new Error("list offline"));
    mocks.countHistoryAssets.mockRejectedValue(new Error("count offline"));

    render(await HistoryPage({}));

    expect(screen.getByText("No generated images yet.")).toBeInTheDocument();
    expect(screen.getByText("Showing 0 of 0 archived images. Page 1.")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Previous" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Next" })).not.toBeInTheDocument();
  });
});
