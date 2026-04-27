// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";

import { GenerationChat } from "../../src/components/chat/GenerationChat";

describe("GenerationChat", () => {
  it("submits prompts and displays job states", () => {
    const onSubmit = vi.fn();

    render(
      <GenerationChat
        messages={[
          { id: "m1", role: "user", content: "Draw a red cube" },
          {
            id: "j1",
            role: "assistant",
            content: "Generation queued",
            status: "queued"
          },
          {
            id: "j2",
            role: "assistant",
            content: "Generation running",
            status: "running"
          },
          {
            id: "j3",
            role: "assistant",
            content: "Image ready",
            status: "succeeded",
            images: [{ id: "asset_1", src: "/generated/job_1/0.png", alt: "Red cube" }]
          },
          {
            id: "j4",
            role: "assistant",
            content: "Provider failed",
            status: "failed"
          }
        ]}
        onSubmit={onSubmit}
      />
    );

    fireEvent.change(screen.getByLabelText("Prompt"), {
      target: { value: "Make it blue" }
    });
    fireEvent.click(screen.getByRole("button", { name: "Generate" }));

    expect(onSubmit).toHaveBeenCalledWith("Make it blue");
    expect(screen.getByText("queued")).toBeTruthy();
    expect(screen.getByText("running")).toBeTruthy();
    expect(screen.getByText("succeeded")).toBeTruthy();
    expect(screen.getByText("failed")).toBeTruthy();
    expect(screen.getByAltText("Red cube")).toBeTruthy();
  });
});
