// @vitest-environment jsdom

import { fireEvent, render, screen, within } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import HomePage, { dynamic } from "../../src/app/page";

const mocks = vi.hoisted(() => ({
  cookieGet: vi.fn(),
  cookies: vi.fn(),
  getAccountSummary: vi.fn(),
  getSessionFromToken: vi.fn(),
  listGenerationOptions: vi.fn(),
  redirect: vi.fn()
}));

vi.mock("next/headers", () => ({
  cookies: mocks.cookies
}));

vi.mock("next/navigation", () => ({
  redirect: mocks.redirect,
  usePathname: () => "/"
}));

vi.mock("../../src/server/auth/request-session", () => ({
  getSessionFromToken: mocks.getSessionFromToken
}));

vi.mock("../../src/server/users/repository", () => ({
  getAccountSummary: mocks.getAccountSummary
}));

vi.mock("../../src/server/providers/repository", () => ({
  listGenerationOptions: mocks.listGenerationOptions
}));

describe("OverviewPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
    mocks.cookieGet.mockReturnValue({ value: "session-token" });
    mocks.cookies.mockResolvedValue({ get: mocks.cookieGet });
    mocks.getAccountSummary.mockImplementation(async (userId: string) => ({
      account: userId === "user_admin" ? "admin" : "member",
      email: `${userId === "user_admin" ? "admin" : "member"}@example.com`
    }));
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
    mocks.redirect.mockImplementation(() => {
      throw new Error("NEXT_REDIRECT");
    });
  });

  it("renders the authenticated shell and three real overview entries for admins", async () => {
    mocks.getSessionFromToken.mockResolvedValue({
      userId: "user_admin",
      role: "ADMIN"
    });

    const { container } = render(await HomePage());
    const actions = within(
      screen.getByRole("navigation", { name: "Overview actions" })
    );
    const overviewCard = screen
      .getByRole("heading", { name: "Image generation workspace" })
      .closest("section");

    expect(dynamic).toBe("force-dynamic");
    expect(overviewCard).toHaveClass("page-card", "overview-card");
    expect(overviewCard).toHaveAttribute("aria-labelledby", "overview-title");
    expect(
      screen.getByRole("img", { name: "GPT Image Workbench logo" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Account: admin" })
    ).toBeInTheDocument();
    expect(screen.getByText("Proxy / gpt-image-2")).toBeInTheDocument();
    expect(actions.getByRole("link", { name: /Create/ })).toHaveAttribute(
      "href",
      "/generate"
    );
    expect(actions.getByRole("link", { name: /History/ })).toHaveAttribute(
      "href",
      "/history"
    );
    expect(
      actions.getByRole("link", { name: /Models/ })
    ).toHaveAttribute("href", "/models");
    expect(actions.getAllByRole("link")).toHaveLength(3);
    expect(screen.queryByRole("link", { name: "Login" })).not.toBeInTheDocument();
    expect(container.querySelector("main.app-shell")).not.toBeInTheDocument();
  });

  it("keeps the Models entry available to members with truthful capabilities", async () => {
    mocks.getSessionFromToken.mockResolvedValue({
      userId: "user_member",
      role: "MEMBER"
    });

    render(await HomePage());
    const actions = within(
      screen.getByRole("navigation", { name: "Overview actions" })
    );

    expect(actions.getByRole("link", { name: /Create/ })).toBeInTheDocument();
    expect(actions.getByRole("link", { name: /History/ })).toBeInTheDocument();
    expect(
      actions.getByRole("link", { name: /Models/ })
    ).toHaveAttribute("href", "/models");
    expect(actions.getAllByRole("link")).toHaveLength(3);
    expect(
      screen.getByRole("button", { name: "Account: member" })
    ).toBeInTheDocument();
    expect(screen.getByText("Queue")).toBeInTheDocument();
    expect(screen.getByText("Archive")).toBeInTheDocument();
    expect(screen.getByText("Reuse")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Login" })).not.toBeInTheDocument();
  });

  it("switches the overview body to Chinese while preserving real model data", async () => {
    mocks.getSessionFromToken.mockResolvedValue({
      userId: "user_member",
      role: "MEMBER"
    });

    render(await HomePage());
    fireEvent.change(screen.getByLabelText("Language"), {
      target: { value: "zh" }
    });

    expect(
      screen.getByRole("heading", { name: "图像生成工作区" })
    ).toBeInTheDocument();
    expect(screen.getByText("队列")).toBeInTheDocument();
    expect(screen.getByText("归档")).toBeInTheDocument();
    expect(screen.getByText("复用")).toBeInTheDocument();
    expect(
      screen.getByRole("navigation", { name: "概览操作" })
    ).toBeInTheDocument();
    expect(screen.getByText("Proxy / gpt-image-2")).toBeInTheDocument();
  });

  it("redirects to login when the session is missing", async () => {
    mocks.cookieGet.mockReturnValue(undefined);
    mocks.getSessionFromToken.mockResolvedValue(null);

    await expect(
      Promise.resolve().then(() => HomePage())
    ).rejects.toThrow("NEXT_REDIRECT");

    expect(mocks.cookieGet).toHaveBeenCalledWith("session");
    expect(mocks.getSessionFromToken).toHaveBeenCalledWith(undefined);
    expect(mocks.redirect).toHaveBeenCalledWith("/login");
  });
});
