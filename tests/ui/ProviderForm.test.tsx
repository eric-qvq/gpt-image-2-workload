// @vitest-environment jsdom

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ProviderForm } from "../../src/components/admin/ProviderForm";

const refresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh })
}));

describe("ProviderForm", () => {
  afterEach(() => {
    refresh.mockClear();
    vi.restoreAllMocks();
  });

  it("marks provider setup fields as required", () => {
    render(<ProviderForm />);

    const form = screen
      .getByRole("button", { name: "Save provider" })
      .closest("form");

    expect(form).toHaveClass("admin-form", "page-card");
    expect(
      screen.getByRole("heading", { name: "Add provider" })
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Provider name")).toBeRequired();
    expect(screen.getByLabelText("Base URL")).toBeRequired();
    expect(screen.getByLabelText("API key")).toBeRequired();
  });

  it("shows the API error when provider creation fails", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ error: "API key is required." }), {
        status: 400
      })
    );

    render(<ProviderForm />);

    fireEvent.change(screen.getByLabelText("Provider name"), {
      target: { value: "OpenAI" }
    });
    fireEvent.change(screen.getByLabelText("Base URL"), {
      target: { value: "https://api.example.com/v1" }
    });
    fireEvent.change(screen.getByLabelText("API key"), {
      target: { value: "sk-test-key" }
    });
    fireEvent.click(screen.getByRole("button", { name: "Save provider" }));

    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent("API key is required.")
    );
  });
});
