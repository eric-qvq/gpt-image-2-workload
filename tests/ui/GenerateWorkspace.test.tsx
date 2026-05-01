// @vitest-environment jsdom

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { GenerateWorkspace } from "../../src/components/generate/GenerateWorkspace";

describe("GenerateWorkspace", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("creates a conversation, queues a generation job, and displays archived images", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ conversation: { id: "conversation_1" } }), {
          status: 201
        })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ job: { id: "job_1", status: "QUEUED" } }), {
          status: 201
        })
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            job: {
              id: "job_1",
              status: "ARCHIVED",
              imageAssets: [{ id: "asset_1" }]
            }
          }),
          { status: 200 }
        )
      );

    render(
      <GenerateWorkspace
        providers={[{ id: "provider_1", name: "Proxy" }]}
        models={[
          {
            id: "model_1",
            providerId: "provider_1",
            name: "gpt-image-2",
            defaultParams: {},
            capabilities: {}
          }
        ]}
        initialParameters={{ count: 2, quality: "high", size: "1024x1024" }}
        pollIntervalMs={0}
        maxPollAttempts={1}
      />
    );

    fireEvent.change(screen.getByLabelText("Prompt"), {
      target: { value: "Draw a red cube" }
    });
    fireEvent.click(screen.getByRole("button", { name: "Generate" }));

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/conversations",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ title: "Draw a red cube" })
        })
      )
    );
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/conversations/conversation_1/messages",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          prompt: "Draw a red cube",
          providerId: "provider_1",
          modelId: "model_1",
          requestParams: {
            size: "1024x1024",
            quality: "high",
            count: 2
          }
        })
      })
    );
    expect(await screen.findByAltText("Draw a red cube")).toHaveAttribute(
      "src",
      "/api/image-assets/asset_1"
    );
    expect(screen.getByText("succeeded")).toBeTruthy();
  });

  it("disables generation when no enabled provider or model exists", () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");

    render(<GenerateWorkspace providers={[]} models={[]} />);

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Add an enabled provider and model before generating."
    );
    expect(screen.getByRole("button", { name: "Generate" })).toBeDisabled();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
