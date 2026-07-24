// @vitest-environment jsdom

import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ProviderEditForm } from "../../src/components/admin/ProviderEditForm";

const refresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh })
}));

const providers = [
  {
    id: "provider_1",
    name: "OpenAI",
    type: "OPENAI_COMPATIBLE" as const,
    baseUrl: "https://old.example.com/v1",
    enabled: true
  },
  {
    id: "provider_2",
    name: "Backup",
    type: "CUSTOM_HTTP" as const,
    baseUrl: "https://backup.example.com/v1",
    enabled: false
  }
];

describe("ProviderEditForm", () => {
  afterEach(() => {
    refresh.mockClear();
    vi.restoreAllMocks();
  });

  it("renders the available editor as a labelled admin card", () => {
    render(<ProviderEditForm providers={providers} />);

    const form = screen
      .getByRole("button", { name: "Update provider" })
      .closest("form");

    expect(form).toHaveClass("admin-form", "page-card");
    expect(
      screen.getByRole("heading", { name: "Edit provider" })
    ).toBeInTheDocument();
  });

  it("renders a labelled admin empty state without edit controls", () => {
    const { container } = render(<ProviderEditForm providers={[]} />);

    const emptyState = container.querySelector("section.admin-empty-state");

    expect(emptyState).toHaveClass("admin-form", "page-card");
    expect(
      within(emptyState as HTMLElement).getByRole("heading", {
        name: "Edit provider"
      })
    ).toBeInTheDocument();
    expect(within(emptyState as HTMLElement).getByRole("status")).toHaveTextContent(
      "Save a provider before editing settings."
    );
    expect(
      within(emptyState as HTMLElement).queryByRole("button", {
        name: "Update provider"
      })
    ).not.toBeInTheDocument();
  });

  it("patches an existing provider without sending a blank API key", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ provider: { id: "provider_1" } }), {
        status: 200
      })
    );

    render(<ProviderEditForm providers={providers} />);

    fireEvent.change(screen.getByLabelText("Base URL"), {
      target: { value: "https://new.example.com/v1" }
    });
    fireEvent.click(screen.getByRole("button", { name: "Update provider" }));

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/admin/providers/provider_1",
        expect.objectContaining({
          method: "PATCH",
          body: JSON.stringify({
            name: "OpenAI",
            type: "OPENAI_COMPATIBLE",
            baseUrl: "https://new.example.com/v1",
            enabled: true
          })
        })
      )
    );
    expect(refresh).toHaveBeenCalled();
  });

  it("loads selected provider values into the form", () => {
    render(<ProviderEditForm providers={providers} />);

    fireEvent.change(screen.getByLabelText("Provider"), {
      target: { value: "provider_2" }
    });

    expect(screen.getByLabelText("Provider name")).toHaveValue("Backup");
    expect(screen.getByLabelText("Base URL")).toHaveValue(
      "https://backup.example.com/v1"
    );
    expect(screen.getByLabelText("Enabled")).not.toBeChecked();
  });
});
