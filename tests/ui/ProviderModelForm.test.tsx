// @vitest-environment jsdom

import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ProviderModelForm } from "../../src/components/admin/ProviderModelForm";

const refresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh })
}));

describe("ProviderModelForm", () => {
  afterEach(() => {
    refresh.mockClear();
    vi.restoreAllMocks();
  });

  it("adds a model to an existing provider", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ model: { id: "model_1" } }), {
        status: 201
      })
    );

    render(
      <ProviderModelForm
        providers={[{ id: "provider_1", name: "OpenAI" }]}
      />
    );

    const form = screen
      .getByRole("button", { name: "Add model" })
      .closest("form");

    expect(form).toHaveClass("admin-form", "page-card");
    expect(
      screen.getByRole("heading", { name: "Add model" })
    ).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Provider"), {
      target: { value: "provider_1" }
    });
    fireEvent.change(screen.getByLabelText("Model name"), {
      target: { value: "gpt-image-2" }
    });
    fireEvent.click(screen.getByRole("button", { name: "Add model" }));

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/admin/providers/provider_1/models",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            name: "gpt-image-2",
            defaultParams: {},
            capabilities: {},
            enabled: true
          })
        })
      )
    );
    expect(refresh).toHaveBeenCalled();
  });

  it("shows an empty state when no provider exists", () => {
    const { container } = render(<ProviderModelForm providers={[]} />);

    const emptyState = container.querySelector("section.admin-empty-state");

    expect(emptyState).toHaveClass("admin-form", "page-card");
    expect(
      within(emptyState as HTMLElement).getByRole("heading", {
        name: "Add model"
      })
    ).toBeInTheDocument();
    expect(within(emptyState as HTMLElement).getByRole("status")).toHaveTextContent(
      "Save a provider before adding models."
    );
    expect(screen.queryByRole("button", { name: "Add model" })).toBeNull();
  });
});
