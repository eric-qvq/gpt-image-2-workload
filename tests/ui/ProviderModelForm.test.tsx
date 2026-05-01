// @vitest-environment jsdom

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ProviderModelForm } from "../../src/components/admin/ProviderModelForm";

describe("ProviderModelForm", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("adds a model to an existing provider", async () => {
    const location = window.location;
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ model: { id: "model_1" } }), {
        status: 201
      })
    );

    Object.defineProperty(window, "location", {
      configurable: true,
      value: { reload: vi.fn() }
    });

    try {
      render(
        <ProviderModelForm
          providers={[{ id: "provider_1", name: "OpenAI" }]}
        />
      );

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
      expect(window.location.reload).toHaveBeenCalled();
    } finally {
      Object.defineProperty(window, "location", {
        configurable: true,
        value: location
      });
    }
  });

  it("shows an empty state when no provider exists", () => {
    render(<ProviderModelForm providers={[]} />);

    expect(screen.getByRole("status")).toHaveTextContent(
      "Save a provider before adding models."
    );
    expect(screen.queryByRole("button", { name: "Add model" })).toBeNull();
  });
});
