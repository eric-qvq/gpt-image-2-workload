// @vitest-environment jsdom

import { fireEvent, render, screen, within } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import ModelsPage, { dynamic } from "../../src/app/models/page";

const mocks = vi.hoisted(() => ({
  cookieGet: vi.fn(),
  cookies: vi.fn(),
  getAccountSummary: vi.fn(),
  getSessionFromToken: vi.fn(),
  listGenerationOptions: vi.fn(),
  listProviders: vi.fn(),
  redirect: vi.fn(),
  refresh: vi.fn()
}));

vi.mock("next/headers", () => ({
  cookies: mocks.cookies
}));

vi.mock("next/navigation", () => ({
  redirect: mocks.redirect,
  usePathname: () => "/models",
  useRouter: () => ({
    back: vi.fn(),
    refresh: mocks.refresh
  })
}));

vi.mock("../../src/server/auth/request-session", () => ({
  getSessionFromToken: mocks.getSessionFromToken
}));

vi.mock("../../src/server/providers/repository", () => ({
  listGenerationOptions: mocks.listGenerationOptions,
  listProviders: mocks.listProviders
}));

vi.mock("../../src/server/users/repository", () => ({
  getAccountSummary: mocks.getAccountSummary
}));

const providers = [
  {
    id: "provider_1",
    name: "OpenAI Proxy",
    type: "OPENAI_COMPATIBLE" as const,
    baseUrl: "https://images.example.com/v1",
    enabled: true,
    createdAt: new Date("2026-07-10T01:02:03.000Z"),
    updatedAt: new Date("2026-07-11T01:02:03.000Z")
  }
];

const generationOptions = {
  providers: [{ id: "provider_1", name: "OpenAI Proxy" }],
  models: [
    {
      id: "model_1",
      providerId: "provider_1",
      name: "gpt-image-2",
      defaultParams: { quality: "standard" },
      capabilities: { image: true }
    }
  ]
};

describe("ModelsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
    mocks.cookieGet.mockReturnValue({ value: "session-token" });
    mocks.cookies.mockResolvedValue({ get: mocks.cookieGet });
    mocks.getSessionFromToken.mockResolvedValue({
      userId: "user_admin",
      role: "ADMIN"
    });
    mocks.getAccountSummary.mockResolvedValue({
      account: "admin",
      email: "admin@example.com"
    });
    mocks.listGenerationOptions.mockResolvedValue(generationOptions);
    mocks.listProviders.mockResolvedValue(providers);
    mocks.redirect.mockImplementation(() => {
      throw new Error("NEXT_REDIRECT");
    });
  });

  it("renders the safe catalog and real provider management for admins", async () => {
    const { container } = render(await ModelsPage());
    const navigation = within(
      screen.getByRole("navigation", { name: "Primary navigation" })
    );
    const catalog = screen.getByRole("region", { name: "Available models" });
    const table = screen.getByRole("table");

    expect(dynamic).toBe("force-dynamic");
    expect(screen.getByRole("heading", { name: "Models", level: 1 }))
      .toBeInTheDocument();
    expect(within(catalog).getByText("OpenAI Proxy / gpt-image-2"))
      .toBeInTheDocument();
    expect(within(table).getByText("OpenAI Proxy")).toBeInTheDocument();
    expect(within(table).getByText("OpenAI compatible")).toBeInTheDocument();
    expect(within(table).queryByText("OPENAI_COMPATIBLE"))
      .not.toBeInTheDocument();
    expect(within(table).getByText("https://images.example.com/v1"))
      .toBeInTheDocument();
    expect(container.querySelector('td[data-label="Name"]'))
      .toHaveTextContent("OpenAI Proxy");
    expect(container.querySelector('td[data-label="Type"]'))
      .toHaveTextContent("OpenAI compatible");
    expect(container.querySelector('td[data-label="Base URL"]'))
      .toHaveTextContent("https://images.example.com/v1");
    expect(container.querySelector('td[data-label="Status"]'))
      .toHaveTextContent("Enabled");
    expect(screen.getByRole("button", { name: "Save provider" }))
      .toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Update provider" }))
      .toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add model" }))
      .toBeInTheDocument();
    expect(navigation.getByRole("link", { name: "Models" }))
      .toHaveAttribute("aria-current", "page");
    expect(container.querySelector(".admin-grid")).toBeInTheDocument();
    expect(mocks.listGenerationOptions).toHaveBeenCalledOnce();
    expect(mocks.listProviders).toHaveBeenCalledOnce();
  });

  it("shows members only the safe model catalog", async () => {
    mocks.getSessionFromToken.mockResolvedValue({
      userId: "user_member",
      role: "MEMBER"
    });
    mocks.getAccountSummary.mockResolvedValue({
      account: "member",
      email: "member@example.com"
    });

    render(await ModelsPage());

    const navigation = within(
      screen.getByRole("navigation", { name: "Primary navigation" })
    );
    const catalog = screen.getByRole("region", { name: "Available models" });
    expect(within(catalog).getByText("OpenAI Proxy / gpt-image-2"))
      .toBeInTheDocument();
    expect(within(catalog).getByText("Current")).toBeInTheDocument();
    expect(screen.queryByText("https://images.example.com/v1"))
      .not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Save provider" }))
      .not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Update provider" }))
      .not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Add model" }))
      .not.toBeInTheDocument();
    expect(screen.queryByLabelText("Base URL")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("API key")).not.toBeInTheDocument();
    expect(document.body).not.toHaveTextContent(/encryptedApiKey/i);
    expect(navigation.getByRole("link", { name: "Models" }))
      .toHaveAttribute("aria-current", "page");
    expect(mocks.listProviders).not.toHaveBeenCalled();
  });

  it("keeps admin controls available when provider listing fails", async () => {
    mocks.listProviders.mockRejectedValue(new Error("database offline"));

    render(await ModelsPage());

    expect(screen.getByText("No providers configured.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save provider" }))
      .toBeInTheDocument();
    expect(screen.getByText("Save a provider before editing settings."))
      .toBeInTheDocument();
    expect(screen.getByText("Save a provider before adding models."))
      .toBeInTheDocument();
  });

  it("switches the model catalog and admin controls to Chinese", async () => {
    render(await ModelsPage());

    fireEvent.change(screen.getByLabelText("Language"), {
      target: { value: "zh" }
    });

    expect(
      screen.getByRole("heading", { name: "模型", level: 1 })
    ).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "可用模型" }))
      .toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "已配置服务商" }))
      .toBeInTheDocument();
    expect(screen.getByRole("button", { name: "保存服务商" }))
      .toBeInTheDocument();
    expect(screen.getByRole("button", { name: "更新服务商" }))
      .toBeInTheDocument();
    expect(screen.getByRole("button", { name: "添加模型" }))
      .toBeInTheDocument();
    expect(screen.getAllByText("OpenAI Proxy / gpt-image-2").length)
      .toBeGreaterThanOrEqual(1);
    expect(screen.getByText("https://images.example.com/v1"))
      .toBeInTheDocument();
  });
});
